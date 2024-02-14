import { FastifyInstance } from "fastify"
import {z} from 'zod'
import { prisma } from "../../lib/prisma"
import { randomUUID } from "crypto"

export  async function voteOnPoll(app: FastifyInstance){
    app.post('/get-poll/:pollId/vote', async (request, reply )=> {
        const voteBody = z.object({
            pollOptionId: z.string().uuid()
        })

        const voteParams = z.object({
            pollId: z.string().uuid()
        })
        
        const { pollOptionId } = voteBody.parse(request.body)
        const { pollId } = voteParams.parse(request.params)

        let {sessionId} = request.cookies

        if (sessionId){
            const userPreviousVoteOnPoll = await prisma.vote.findUnique({
                where: {
                    sessionId_pollId: {
                        sessionId,
                        pollId
                    }
                }
            })

            if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId !== pollOptionId){
                //apaga voto
                await prisma.vote.delete({
                    where:{
                        id:userPreviousVoteOnPoll.id
                    }
                })

            }else if(userPreviousVoteOnPoll){
                return reply.status(400).send({message: "You already voted on this poll"})
            }
        }

        if (!sessionId){

             sessionId = randomUUID()
    
            reply.setCookie('sessionId',sessionId,{
                path: '/',
                maxAge: 60*60*24*30, //30 dias
                signed: true,
                httpOnly: true,
            })
        }

        await prisma.vote.create({
            data:{
                sessionId,
                pollId,
                pollOptionId
            }
        })


        return reply.status(201).send()
    })
}
