# GraalVM native image

An investigation from November 2026, before the move to server sessions, into running the backend as a
native image. Result: it works, but it isn't worth it for REIMS2.

## What was tried

`mvn -Pnative -DskipTests native:compile` (Spring Boot's own `native` profile) in
`ghcr.io/graalvm/native-image-community:25`, with no code changes. The binary passed the full Chromium e2e
suite.

|              | JVM                                   | Native  |
| ------------ | ------------------------------------- | ------- |
| Startup      | 6.4 s (2.8 s with a JDK 25 AOT cache) | 0.7 s   |
| Memory (RSS) | ~400 MB                               | ~250 MB |

The build took about 6 minutes at 8.4 GB peak memory and produced a 207 MB glibc binary.

## Why not

- Startup doesn't matter for a single long-running container, so the gain is about 150 MB of memory.
- Every `main` push that touches the backend would spend 5 to 6 more minutes before deploy, Renovate's
  dependency updates included.
- The Dockerfile would need a GraalVM build stage and a glibc runtime image with a healthcheck tool, PRs a
  JVM target to keep e2e fast, and Renovate one more image to track.
- Backend tests run on the JVM, so a bug only the native image has would first show in `main`'s e2e,
  after the merge.

Worth revisiting if the box runs short of memory. New dependencies that use reflection may need
reachability hints by then.
