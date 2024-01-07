import { assertEquals } from '$std/assert/mod.ts';
import { speech } from './speech.ts';

Deno.test('speech', async () => {
    const sound = await speech('hello');
    assertEquals(sound?.startsWith('data:audio/mpeg;base64'), true);
});