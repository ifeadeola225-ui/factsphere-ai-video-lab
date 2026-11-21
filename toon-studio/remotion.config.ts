import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';

// Software ANGLE works in headless containers with no GPU; switch to 'angle' on a machine with one.
Config.setChromiumOpenGlRenderer('swangle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(2);

// In this cloud container Remotion can't download its own browser; use the pre-installed headless shell.
// On a local machine, delete this line and Remotion will fetch its own.
const LOCAL_SHELL = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (existsSync(LOCAL_SHELL)) Config.setBrowserExecutable(LOCAL_SHELL);
