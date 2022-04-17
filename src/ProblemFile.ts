import * as path from "path";
import axios from "./customAxios";
import Language from "./Language/Laguage";

export default class ProblemFile {
  private url: string;
  private problemNumber: string;
  private language: Language;
  
  constructor(url: string) {
    this.url = url;
    const problemNames = path.basename(this.url).split(".");
    this.problemNumber = problemNames[0];
    this.language = Language.create(problemNames[1]);
  }

  async getWebviewContent(): Promise<string> {
    const { data } = await axios.get(
      `https://www.acmicpc.net/problem/${this.problemNumber}`
    );
    return data.toString();
  }
}