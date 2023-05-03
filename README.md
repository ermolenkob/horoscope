# Horoscope (ironic)

## General info

This project makes a request to [ChatGPT](https://openai.com/blog/chatgpt) for an ironic horoscope. Daily data is stored in a separate file _cache.txt_ and updated once a day if necessary.

## Work with

1. Contacting third-party API services;
2. _EventEmitter_ and _async/await_;

## Setup

Inside the _horoscopeGPT.js_ file, you need to specify your [apiKey](https://platform.openai.com/account/api-keys) to request to [ChatGPT](https://openai.com/blog/chatgpt).

```
const apiKey = "your-api-key-here";
```
