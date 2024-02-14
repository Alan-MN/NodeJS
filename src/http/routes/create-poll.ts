import fastify, { FastifyInstance } from "fastify"
import {z} from 'zod'
import { prisma } from "../../lib/prisma"

export  async function createPoll(app: FastifyInstance){
    app.post('/create-polls', async (request, reply )=> {
        const createPollBody = z.object({
            title: z.string()
        })
        
        const { title } = createPollBody.parse(request.body)
    
       const poll = await prisma.poll.create({
            data:{
                title,
            }
        })
        return reply.status(201).send({
            poll_id: poll.id
        })
    })
}
