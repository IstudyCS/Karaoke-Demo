FROM gcc:13 AS builder

RUN apt-get update && apt-get install -y --no-install-recommends cmake && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j$(nproc)

FROM debian:bookworm-slim
COPY --from=builder /app/build/server /usr/local/bin/server
EXPOSE 9001
CMD ["server"]
