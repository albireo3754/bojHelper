import { ChildProcessWithoutNullStreams } from "child_process";
import * as process from "child_process";

export default abstract class Language {
  abstract excuteTerminal(
    testfile: string,
    problemNumber: string
  ): ChildProcessWithoutNullStreams;

  static create(ext: string): Language {
    if (ext == "cpp") {
      return new Cpp();
    } else if (ext == "js") {
      return new JS();
    }
    return new Python3();
  }
}

class Python3 implements Language {
  excuteTerminal(
    testfile: string,
    problemNumber: string
  ): ChildProcessWithoutNullStreams {
    return process.spawn("python3", [testfile]);
  }
}

class Cpp implements Language {
  excuteTerminal(
    testFileURL: string,
    problemNumber: string
  ): ChildProcessWithoutNullStreams {
    const objectFileURL = testFileURL.slice(0, testFileURL.length - 4);
    process.execSync(`g++ -std=c++17 ${testFileURL} -o ${objectFileURL}`);
    return process.spawn(`${objectFileURL}`);
  }
}

class JS implements Language {
  excuteTerminal(
    testfile: string,
    problemNumber: string
  ): ChildProcessWithoutNullStreams {
    return process.spawn("node", [testfile]);
  }
}
