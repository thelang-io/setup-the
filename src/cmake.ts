import { execa } from 'execa'

export interface CMakeVariable {
  name: string
  type?: string
  value: string
}

export interface CMakeGenerateOptions {
  buildPath?: string
  generator?: string
  variables?: CMakeVariable[]
}

export interface CMakeBuildOptions {
  config?: string
  preset?: string
  target?: string
}

export interface CMakeInstallOptions {
  config?: string
  prefix?: string
}

// https://cmake.org/cmake/help/latest/manual/cmake.1.html
export class CMake {
  public async generate (sourcePath: string, options: CMakeGenerateOptions = {}): Promise<void> {
    const args = [sourcePath]

    if (options.buildPath !== undefined) {
      args.push('-B', options.buildPath)
    }

    if (options.generator !== undefined) {
      args.push('-G', options.generator)
    }

    if (options.variables !== undefined) {
      args.push(...this.variables(options.variables))
    }

    await execa('cmake', args)
  }

  public async build (dir: string, options: CMakeBuildOptions = {}): Promise<void> {
    const args = ['--build', dir]

    if (options.config !== undefined) {
      args.push('--config', options.config)
    }

    if (options.preset !== undefined) {
      args.push('--preset', options.preset)
    }

    if (options.target !== undefined) {
      args.push('--target', options.target)
    }

    await execa('cmake', args)
  }

  public async install (dir: string, options: CMakeInstallOptions = {}): Promise<void> {
    const args = ['--install', dir]

    if (options.config !== undefined) {
      args.push('--config', options.config)
    }

    if (options.prefix !== undefined) {
      args.push('--prefix', options.prefix)
    }

    await execa('cmake', args)
  }

  private variables (variables: CMakeVariable[]): string[] {
    return variables.map((variable) => {
      if (variable.type !== undefined) {
        return ['-D', `${variable.name}:${variable.type}=${variable.value}`]
      }

      return ['-D', `${variable.name}=${variable.value}`]
    }).flat()
  }
}

export const cmake = new CMake()
