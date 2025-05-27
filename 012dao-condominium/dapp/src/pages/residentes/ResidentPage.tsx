import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import SwitchInput from "../../components/SwitchInput";
import { Resident, addResident, doLogout, getResident, isManager, setCounselor } from "../../services/Web3Services";
import { useNavigate, useParams } from "react-router-dom";

//const ADAPTER_ADDRESS = `${import.meta.env.VITE_ADAPTER_ADDRESS}`

function ResidentPage(){
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [resident, setResident] = useState<Resident>({} as Resident);

    const navigate = useNavigate();

    let { wallet } = useParams();

    useEffect(()=>{

        if(!isManager()){
            doLogout();
            navigate("/");
        }
        if(wallet){
            setIsLoading(true);
            getResident(wallet)
                .then(resident => {
                    console.log("Resident: ",resident);
                    setResident(resident);
                    setIsLoading(false);
                })
                .catch(err =>{
                    setMessage(err.message);
                    setIsLoading(false);
                })
        }

    }, [wallet]);

    function onResidentChange(evt: React.ChangeEvent<HTMLInputElement>){
        //console.log("Resident On Change: ",resident);
        setResident(prevState => ({...prevState, [evt.target.id]: evt.target.value}));

    }

    async function btnSaveClick(){
        if(resident){

            setMessage("Connecting to wallet... wait...")

            if(!wallet){

                await addResident(resident.wallet, resident.residence)
                    .then(tx => {
                        setMessage("Transaction sent, it may take some minutes to take effect: " + tx.hash);
                        navigate("/residents?tx=" + tx.hash);
                    })
                    .catch(err => {
                    setMessage(err.message);
            
                });
            }
            else{
                await setCounselor(resident.wallet, resident.isCounselor)
                    .then(tx => {
                        setMessage("Transaction sent, it may take some minutes to take effect: " + tx.hash);
                        navigate("/residents?tx=" + tx.hash);
                    })
                    .catch(err => {
                    setMessage(err.message); 
                });
            }
        }
    }

    function getNextPayment(){

        const dataMs = Number(resident.nextPayment) * 1000;

        if(!dataMs) 
            return "Never Payed";

        return new Date(dataMs).toDateString();
    }

    function getNextPaymentClassName(){
        let className = "input-group input-group-outline ";
        const dataMs = Number(resident.nextPayment) * 1000;

        if(!dataMs || dataMs < Date.now())
            return className + "is-invalid";
        
        return className + "is-valid";
    }

    return(
        <>
            <Sidebar/>
           
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-12">
                    <div className="card my-4">
                        <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                        <div className="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                            <h6 className="text-white text-capitalize ps-3">
                                <i className="material-icons opacity-10 me-2">group</i>
                                New Resisident
                            </h6>
                        </div>
                        </div>
                        <div className="card-body px-0 pb-2">
                            {
                                isLoading
                                ?(
                                    <div className="row ms-3">
                                        <div className="col-md-6 mb-3">
                                          <p> 
                                            <i className="material-icons opacity-10 me-2">hourglass_empty</i>
                                            Loading...
                                          </p>
                                        </div>
                                    </div>
                                )
                                :
                                <></>
                            }
                            <div className="row ms-3">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="wallet">Wallet Address:</label>
                                        <div className="input-group input-group-outline">
                                            <input className="form-control" type="text" id="wallet" value={resident.wallet || ""} 
                                                placeholder="0x00..." onChange={onResidentChange} disabled={!!wallet}></input>
                                        </div>        
                                    </div>
                                </div>
                            </div>
                            <div className="row ms-3">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="residence">Resident ID (block + appartment):</label>
                                        <div className="input-group input-group-outline">
                                            <input className="form-control" type="number" id="residence" value={resident.residence || ""} 
                                                placeholder="1101" onChange={onResidentChange} disabled={!!wallet}></input>
                                        </div>                                       
                                    </div>
                                </div>
                            </div>
                            {
                                wallet
                                ?
                                <div className="row ms-3">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="nextPayment">Next Payment:</label>
                                            <div className={getNextPaymentClassName()}>
                                                <input className="form-control" type="text" id="nextPayment" value={getNextPayment()} disabled={true}></input>
                                            </div>                                       
                                        </div>
                                    </div>
                                </div>

                                :
                                <></>
                            }


                            {
                                isManager() && wallet //so permite alterar para conselheiro, se já for morador
                                ?(
                                    <div className="row ms-3">
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <SwitchInput id="isCounselor" isChecked={resident.isCounselor  || false} 
                                                text="Is Counselor?" onChange={onResidentChange}/>
                                            </div>
                                        </div>
                                    </div>
                                )
                                :<></>
                            }
                                                        
                            <div className="row ms-3">
                                <div className="col-md-12 mb-3">
                                    <button className="btn bg-gradient-dark me-2" onClick={btnSaveClick}>
                                        <i className="material-icons opacity-10 me-2">save</i>
                                        Save Resident
                                    </button>
                                    <span className="text-danger">
                                        {message}
                                    </span>
                                </div>
                            </div>
                                                        
                        </div>
                    </div>
                    <Footer/>
                    </div>
                </div>
                </div>
            </main>
            

        </>
    );

}
export default ResidentPage;