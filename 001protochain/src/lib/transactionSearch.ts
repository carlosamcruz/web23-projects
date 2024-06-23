import Transacion from "./transaction";

export default interface TransactionSearch{
    transaction: Transacion;
    mempoolIndex: number;
    blockIndex: number;
}