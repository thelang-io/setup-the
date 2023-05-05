import type { ExecFileSyncOptions } from 'child_process'
import * as path from 'path'
import { execFileSync } from 'child_process'
import { test } from '@jest/globals'

test('test runs', () => {
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')

  const options: ExecFileSyncOptions = {
    env: process.env
  }

  console.log(execFileSync(np, [ip], options).toString())
})

test('test runs specific version', () => {
  process.env.INPUT_VERSION = '0.13.0'

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')

  const options: ExecFileSyncOptions = {
    env: process.env
  }

  console.log(execFileSync(np, [ip], options).toString())
})
