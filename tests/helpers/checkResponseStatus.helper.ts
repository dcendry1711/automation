import { APIResponse, expect } from "../fixtures/api.fixture"

export function checkResponseStatus(response: APIResponse, expVal: number){
    expect(response.status()).toBe(expVal)
}