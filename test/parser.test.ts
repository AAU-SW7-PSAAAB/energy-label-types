import assert from 'assert'
import { describe, it } from 'node:test'

import {callConsts} from "../lib/index.js"


describe('Parser', () => {
    it('it can parse a version responce', async () => {
        const res = new Response('{"version" : "1.0.0"}');
        const version = await callConsts['/version'].parse(res)

        assert.strictEqual(version.version, "1.0.0")
    })
})


