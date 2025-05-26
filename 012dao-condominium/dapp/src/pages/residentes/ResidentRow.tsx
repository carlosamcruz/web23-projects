import { Resident, isManager } from "../../services/Web3Services";

type Props = {
    data: Resident;
    onDelete: Function;
}
/**
 * props 
 * - data - Resident Type
 * - onDelete - Funcion
 */
function ResidentRow(props: Props){

    function nextPayment(){
        const dataMs = Number(props.data.nextPayment) * 1000;
        const text = dataMs? "Never Paid": new Date(dataMs).toDateString();
        let color = "text-success";

        if(!dataMs || dataMs < Date.now())
            color = "text-danger";
        return(
            <p className={"text-xs mb-0 ms-3 " + color}>
                {text}
            </p>
        );

    }

    function btnDeleteClick(){
        if(window.confirm("Are you sure to delete this resident?"))
            props.onDelete(props.data.wallet);
    }

    return(
        
        <tr>
            <td>
                <div className="d-flex px-3 py-1">
                    <div className="d-flex flex-column justify-content-center">
                        <h6 className="mb-0 text-sm">{props.data.wallet}</h6>
                    </div>
                </div>
            </td>
            <td>
                <p className="text-xs font-weight-bold mb-0 px-3">{Number(props.data.residence)}</p>
            </td>
            <td>
                <p className="text-xs font-weight-bold mb-0 px-3">{JSON.stringify(props.data.isCounselor)}</p>
            </td>
            <td>
               {nextPayment()}
            </td>
            <td>
                {
                    isManager()
                    ?
                    <>
                        <a href={"/residents/edit/" + props.data.wallet} className="btn btn-info btn-sm me-1">
                            <i className="material-icons text-sm">edit</i>
                        </a>
                        <a href={"#" + props.data.wallet} className="btn btn-danger btn-sm me-1" onClick={btnDeleteClick}>
                            <i className="material-icons text-sm">delete</i>
                        </a>

                    </>
                    :
                    <></>
                }
            </td>
        </tr>
        
    );


}

export default ResidentRow;