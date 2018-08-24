# simple-fm
Web Audio API FM Synth

Initially this repo is me scratching an itch to implement Max MSP's [Simple FM](https://docs.cycling74.com/max5/tutorials/msp-tut/mspchapter11.html) patch via the Web Audio API

In making the envelopes and whatnot, I came across some of the issues [I'd previously encountered...](https://github.com/crosslandwa/push-wrapper-example-site/blob/master/learnings.md)

## Run locally

```bash
npm install
npm run build
open dist/index.html

npm run build -- --watch #re-build on file changes
```

Also:
```bash
npm run test
npm run lint
```
