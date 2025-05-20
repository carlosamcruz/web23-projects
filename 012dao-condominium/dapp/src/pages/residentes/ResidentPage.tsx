import { useState, useEffect } from "react";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

const ADAPTER_ADDRESS = `${import.meta.env.VITE_ADAPTER_ADDRESS}`

function ResidentPage(){
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

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
                                            <input className="form-control" type="text" id="wallet" value="" placeholder="0x00..."></input>
                                        </div>        
                                    </div>
                                </div>
                            </div>
                            <div className="row ms-3">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="residence">Resident ID:</label>
                                        <div className="input-group input-group-outline">
                                            <input className="form-control" type="number" id="residence" value="" placeholder="1101" ></input>
                                        </div>                                       
                                    </div>
                                </div>
                            </div>
                            <div className="row ms-3">
                                <div className="col-md-12 mb-3">
                                    <button className="btn bg-gradient-dark me-2" >
                                        <i className="material-icons opacity-10 me-2">save</i>
                                        Save Settings
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