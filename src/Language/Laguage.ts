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
    const objectFileURL = testFileURL.slice(0, testFileURL.length - 4)
    process.execSync(`g++ ${testFileURL} -o ${objectFileURL}`);
    return process.spawn(`${objectFileURL}`);
  }
}
