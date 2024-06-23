import request from 'supertest';
import { describe, test, expect, jest } from '@jest/globals';
import { app } from '../src/server/blockchainServer';
import Block from '../src/lib/block';
import Transacion from '../src/lib/transaction';

jest.mock("../src/lib/block")
jest.mock("../src/lib/blockchain")

describe('BlockchainServer Tests', () => {
    test('GET /status - should return status', async() => {

        const response = await request(app)
        .get('/status/');

        expect(response.status).toEqual(200);
        expect(response.body.isValid.success).toEqual(true);
    })

    test('GET /blocks/next - should get next block info', async() => {

        const response = await request(app)
        .get('/blocks/next');

        expect(response.status).toEqual(200);
        expect(response.body.index).toEqual(1);
    })

    test('GET /blocks/:index - should get genesis', async() => {

        const response = await request(app)
        .get('/blocks/0');

        expect(response.status).toEqual(200);
        expect(response.body.index).toEqual(0);
    })

    test('GET /blocks/:hash - should get block', async() => {

        const response = await request(app)
        .get('/blocks/abc');

        expect(response.status).toEqual(200);
        expect(response.body.hash).toEqual("abc");
    })

    test('GET /blocks/:index - should NOT get genesis', async() => {

        const response = await request(app)
        .get('/blocks/-1');

        expect(response.status).toEqual(404);
        
    })

    test('POST /blocks/ - should add block', async() => {

        const block = new Block({
            index: 1
        } as Block);
        const response = await request(app)
        .post('/blocks/')
        .send(block);

        expect(response.status).toEqual(201);
        expect(response.body.index).toEqual(1);
    })

    test('POST /blocks/ - should NOT add block (empty)', async() => {

        const response = await request(app)
        .post('/blocks/')
        .send({});

        expect(response.status).toEqual(422);
    })

    test('POST /blocks/ - should NOT add block (invalid)', async() => {

        const block = new Block({
            index: -1
        } as Block);
        const response = await request(app)
        .post('/blocks/')
        .send(block);

        expect(response.status).toEqual(400);
    })

    test('GET /transactions/:hash - should get transaction', async() => {

        const response = await request(app)
        .get('/transactions/abc');

        expect(response.status).toEqual(200);
        expect(response.body.mempoolIndex).toEqual(0);
    })

    test('POST /transactions/ - should add tx', async() => {


        const tx = new Transacion({
            data: 'tx 1'
        } as Transacion)

        const response = await request(app)
        .post('/transactions/')
        .send(tx);

        expect(response.status).toEqual(201);
        //expect(response.body.index).toEqual(1);
    })

})