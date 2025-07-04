import { Queue} from 'bull'
import Redis from 'ioredis'

const redisConfig = {
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null,
}

// 创建视频生成队列
export const videoQueue = new Queue('ai-video-generation', {
    redis: redisConfig,
    defaultJobOptions: {
        // removeOnComplete: true,
        // removeOnFail: true,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
})