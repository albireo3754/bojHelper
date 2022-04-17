import * as path from "path";
import axios from "./customAxios";
import Language from "./Language/Laguage";
import parse, { HTMLElement } from "node-html-parser";
import * as fs from "fs";
import { toNamespacedPath } from "path/posix";

export default class ProblemFile {
  private url: string;
  private problemNumber: string;
  private language: Language;
  private cache: Cache;
  private remote: Remote;

  constructor(cachePath: string, url: string) {
    this.url = url;
    const problemNames = path.basename(this.url).split(".");
    this.problemNumber = problemNames[0];
    this.language = Language.create(problemNames[1]);
    this.cache = new Cache(cachePath, this.problemNumber);
    this.remote = new Remote();
  }

  async getHTML(): Promise<string> {
    if (!this.cache.htmlExist()) {
      const { data } = await axios.get(
        `https://www.acmicpc.net/problem/${this.problemNumber}`
      );
      this.cache.saveHTML(data);
    }
    return this.cache.loadHTML();
  }
}

class Remote {

}

class Cache {
  directory: { problem: string, answer: string, html: string };
  
  constructor(private cachePath: string, private problemNumber: string) {
    const problem = path.join(
      cachePath,
      "problem",
      `${this.problemNumber}`
    );
    const answer = path.join(
      cachePath,
      "answer",
      `${this.problemNumber}`
    );
    const htmlBase = path.join(
      cachePath,
      "html",
    );
    
    const htmlConfigPath = path.join(htmlBase, "config.json");
    if (!fs.existsSync(htmlConfigPath)) {
      fs.mkdirSync(htmlBase, {
        recursive: true,
      });
      this.updateCache(htmlBase);
    } else {
      const latest = fs.readFileSync(htmlConfigPath).toString();
      if (Date.now() - parseInt(latest) > 86400000) {
        this.updateCache(htmlBase);
      }
    }
    const latest = fs.readFileSync(htmlConfigPath).toString();
    const html = path.join(htmlBase, latest, `${this.problemNumber}.html`);
    this.directory = { problem, answer, html };
  }

  private updateCache(htmlBase: string) {
    let now = Date.now(); 
    fs.writeFileSync(path.join(htmlBase, "config.json"), now.toString());
    fs.mkdirSync(path.join(htmlBase, now.toString()));
  }

  htmlExist(): boolean {
    if (fs.existsSync(this.directory.html)) {
      return true;
    }
    return false;
  }

  saveHTML(data: any) { 
    fs.writeFileSync(this.directory.html, data);
  }

  loadHTML(): string {
    return fs.readFileSync(this.directory.html).toString();
  }

  private saveCache(testCases: HTMLElement[]) {
    for (let i = 0, j = 0; i < testCases.length; i += 2, j++) {
      let problemString = testCases[i].innerText.replace("\r\n", "\n");
      // 끝이 엔터로 끝나지 않으면
      if (!problemString.match(/\t$/)) {
        problemString += `\n`;
      }
      fs.mkdirSync(this.directory.problem, {
        recursive: true,
      });
      fs.writeFileSync(path.join(this.directory.problem, `${j + 1}.txt`), problemString);
      let answerString = testCases[i + 1].innerText.replace("\r\n", "\n");
      // 끝이 엔터로 끝나지 않으면
      if (!answerString.match(/\t$/)) {
        answerString += `\n`;
      }
      fs.mkdirSync(this.directory.answer, {
        recursive: true,
      });
      fs.writeFileSync(path.join(this.directory.answer, `${j + 1}.txt`), answerString);
    }
  }

  cacheExist(): boolean {
    if (fs.existsSync(this.directory.problem) && fs.existsSync(this.directory.answer)) {
      return true;
    }
    return false;
  }

  loadCache(): { problemBuffer: Buffer, answerBuffer:Buffer }[] {
    const fileLists = fs.readdirSync(this.directory.problem);
    let result = [];
    for (let i = 1; i <= fileLists.length; i++) {
      const problemBuffer = fs.readFileSync(
        path.join(this.directory.problem, `${i}.txt`)
      );

      const answerBuffer = fs.readFileSync(
        path.join(this.directory.answer, `${i}.txt`)
      );
      result.push({ problemBuffer, answerBuffer });
    }
    return result;
  }
}