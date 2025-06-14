import Resident from '../models/resident';
import connect from '../db';

const COLLECTION = "residents";

async function getResident(wallet: string): Promise<Resident | null>{

    const db = await connect();
    const resident = await db.collection(COLLECTION).findOne({wallet: RegExp(wallet, "i")});

    if(!resident) return null;

    return new Resident(resident.wallet, resident.name, resident.profile, resident.phone, resident.email);
}

async function addResident(resident: Resident): Promise<Resident>{

    const db = await connect();
    const result = await db.collection(COLLECTION).insertOne(resident);

    resident._id = result.insertedId;

    return resident;
}

async function updateResident(wallet: string, data: Resident): Promise<Resident | null>{

    const db = await connect();
    await db.collection(COLLECTION).updateOne({wallet: RegExp(wallet, "i")}, {$set: data});
    return getResident(wallet);
}

async function deletResident(wallet: string): Promise<boolean>{

    const db = await connect();
    const result = await db.collection(COLLECTION).deleteOne({wallet: RegExp(wallet, "i")});
    return result.deletedCount > 0;
}

export default {
    getResident,
    addResident,
    updateResident,
    deletResident
}