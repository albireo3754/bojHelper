import axios from "axios";
import parse, { HTMLElement } from "node-html-parser";
import * as fs from "fs";
import * as path from "path";

export default class BOJ {
  constructor(private globalUri: string) {}

  async load(problemNumber: string | number) {
    const problemDirectory = path.join(
      this.globalUri,
      "problem",
      `${problemNumber}`
    );
    const answerDirectory = path.join(
      this.globalUri,
      "answer",
      `${problemNumber}`
    );
    if (
      !this.fileExist(problemNumber) ||
      !this.isFileHasSameLength(problemDirectory, answerDirectory)
    ) {
      const testCases = await this.crawl(problemNumber);
      this.save(testCases, problemNumber);
    }
  }

  isFileHasSameLength(
    problemDirectory: string,
    answerDirectory: string
  ): boolean {
    return (
      fs.readdirSync(problemDirectory).length ===
      fs.readdirSync(answerDirectory).length
    );
  }
  async crawl(problemNumber: string | number) {
    const { data } = await axios.get(
      `https://www.acmicpc.net/problem/${problemNumber}`
    );
    const testCases = await parse(data).querySelectorAll(".sampledata");
    return testCases;
  }

  save(testCases: HTMLElement[], problemNumber: string | number) {
    const problemDirectory = path.join(
      this.globalUri,
      "problem",
      `${problemNumber}`
    );
    const answerDirectory = path.join(
      this.globalUri,
      "answer",
      `${problemNumber}`
    );
    for (let i = 0; i < testCases.length; i += 2) {
      fs.mkdirSync(problemDirectory, {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(problemDirectory, `${i}.txt`),
        testCases[i].innerText
      );
      fs.mkdirSync(answerDirectory, {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(answerDirectory, `${i}.txt`),
        testCases[i + 1].innerText
      );
    }
  }

  fileExist(problemNumber: string | number): boolean {
    return false;
  }

  test() {}
}

// const boj = new BOJ(__dirname);
// boj.bojCrawlandSave(1826).then((data) => console.log(data));
