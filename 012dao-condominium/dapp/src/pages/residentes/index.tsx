import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import Alert from "../../components/Alert";

function Residents(){

    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");

    function useQuery(){
        return new URLSearchParams(useLocation().search);
    }

    const query = useQuery();

    useEffect(()=>{

        const tx = query.get("tx");

        console.log("TX:" + tx)

        if(tx){

            console.log("TX2:" + tx)

            setMessage("Your transaction is being processed. It may take some minutes to take effect.");
        }



    }, []);

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
                                Residents
                            </h6>
                        </div>
                        </div>
                        <div className="card-body px-0 pb-2">
                            {
                                message
                                ?
                                    <Alert alertClass="alert-success" materialIcon="thumb_up_off_alt" title="Success!" text={message}/>
                                :
                                    <></>

                            }
                            {
                                error
                                ?
                                    <Alert alertClass="alert-danger" materialIcon="error" title="Error!" text={error}/>
                                :
                                    <></>

                            }
                            <div className="table-responsive p-0">
                                <table className="table align-items-center mb-0">
                                <thead>
                                    <tr>
                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Author</th>
                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Function</th>
                                    <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                                    <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Employed</th>
                                    <th className="text-secondary opacity-7"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                    <td>
                                        <div className="d-flex px-2 py-1">
                                        <div>
                                            <img src="../assets/img/team-2.jpg" className="avatar avatar-sm me-3 border-radius-lg" alt="user1"/>
                                        </div>
                                        <div className="d-flex flex-column justify-content-center">
                                            <h6 className="mb-0 text-sm">John Michael</h6>
                                            <p className="text-xs text-secondary mb-0">john@creative-tim.com</p>
                                        </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-xs font-weight-bold mb-0">Manager</p>
                                        <p className="text-xs text-secondary mb-0">Organization</p>
                                    </td>
                                    <td className="align-middle text-center text-sm">
                                        <span className="badge badge-sm bg-gradient-success">Online</span>
                                    </td>
                                    <td className="align-middle text-center">
                                        <span className="text-secondary text-xs font-weight-bold">23/04/18</span>
                                    </td>
                                    <td className="align-middle">
                                        <a href="javascript:;" className="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user">
                                        Edit
                                        </a>
                                    </td>
                                    </tr>
                                    <tr>
                                    <td>
                                        <div className="d-flex px-2 py-1">
                                        <div>
                                            <img src="../assets/img/team-3.jpg" className="avatar avatar-sm me-3 border-radius-lg" alt="user2"/>
                                        </div>
                                        <div className="d-flex flex-column justify-content-center">
                                            <h6 className="mb-0 text-sm">Alexa Liras</h6>
                                            <p className="text-xs text-secondary mb-0">alexa@creative-tim.com</p>
                                        </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-xs font-weight-bold mb-0">Programator</p>
                                        <p className="text-xs text-secondary mb-0">Developer</p>
                                    </td>
                                    <td className="align-middle text-center text-sm">
                                        <span className="badge badge-sm bg-gradient-secondary">Offline</span>
                                    </td>
                                    <td className="align-middle text-center">
                                        <span className="text-secondary text-xs font-weight-bold">11/01/19</span>
                                    </td>
                                    <td className="align-middle">
                                        <a href="javascript:;" className="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user">
                                        Edit
                                        </a>
                                    </td>
                                    </tr>
                                    <tr>
                                    <td>
                                        <div className="d-flex px-2 py-1">
                                        <div>
                                            <img src="../assets/img/team-4.jpg" className="avatar avatar-sm me-3 border-radius-lg" alt="user3"/>
                                        </div>
                                        <div className="d-flex flex-column justify-content-center">
                                            <h6 className="mb-0 text-sm">Laurent Perrier</h6>
                                            <p className="text-xs text-secondary mb-0">laurent@creative-tim.com</p>
                                        </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-xs font-weight-bold mb-0">Executive</p>
                                        <p className="text-xs text-secondary mb-0">Projects</p>
                                    </td>
                                    <td className="align-middle text-center text-sm">
                                        <span className="badge badge-sm bg-gradient-success">Online</span>
                                    </td>
                                    <td className="align-middle text-center">
                                        <span className="text-secondary text-xs font-weight-bold">19/09/17</span>
                                    </td>
                                    <td className="align-middle">
                                        <a href="javascript:;" className="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user">
                                        Edit
                                        </a>
                                    </td>
                                    </tr>
                                    <tr>
                                    <td>
                                        <div className="d-flex px-2 py-1">
                                        <div>
                                            <img src="../assets/img/team-3.jpg" className="avatar avatar-sm me-3 border-radius-lg" alt="user4"/>
                                        </div>
                                        <div className="d-flex flex-column justify-content-center">
                                            <h6 className="mb-0 text-sm">Michael Levi</h6>
                                            <p className="text-xs text-secondary mb-0">michael@creative-tim.com</p>
                                        </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-xs font-weight-bold mb-0">Programator</p>
                                        <p className="text-xs text-secondary mb-0">Developer</p>
                                    </td>
                                    <td className="align-middle text-center text-sm">
                                        <span className="badge badge-sm bg-gradient-success">Online</span>
                                    </td>
                                    <td className="align-middle text-center">
                                        <span className="text-secondary text-xs font-weight-bold">24/12/08</span>
                                    </td>
                                    <td className="align-middle">
                                        <a href="javascript:;" className="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user">
                                        Edit
                                        </a>
                                    </td>
                                    </tr>
                                    <tr>
                                    <td>
                                        <div className="d-flex px-2 py-1">
                                        <div>
                                            <img src="../assets/img/team-2.jpg" className="avatar avatar-sm me-3 border-radius-lg" alt="user5"/>
                                        </div>
                                        <div className="d-flex flex-column justify-content-center">
                                            <h6 className="mb-0 text-sm">Richard Gran</h6>
                                            <p className="text-xs text-secondary mb-0">richard@creative-tim.com</p>
                                        </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-xs font-weight-bold mb-0">Manager</p>
                                        <p className="text-xs text-secondary mb-0">Executive</p>
                                    </td>
                                    <td className="align-middle text-center text-sm">
                                        <span className="badge badge-sm bg-gradient-secondary">Offline</span>
                                    </td>
                                    <td className="align-middle text-center">
                                        <span className="text-secondary text-xs font-weight-bold">04/10/21</span>
                                    </td>
                                    <td className="align-middle">
                                        <a href="javascript:;" className="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user">
                                        Edit
                                        </a>
                                    </td>
                                    </tr>
                                    <tr>
                                    <td>
                                        <div className="d-flex px-2 py-1">
                                        <div>
                                            <img src="../assets/img/team-4.jpg" className="avatar avatar-sm me-3 border-radius-lg" alt="user6"/>
                                        </div>
                                        <div className="d-flex flex-column justify-content-center">
                                            <h6 className="mb-0 text-sm">Miriam Eric</h6>
                                            <p className="text-xs text-secondary mb-0">miriam@creative-tim.com</p>
                                        </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-xs font-weight-bold mb-0">Programator</p>
                                        <p className="text-xs text-secondary mb-0">Developer</p>
                                    </td>
                                    <td className="align-middle text-center text-sm">
                                        <span className="badge badge-sm bg-gradient-secondary">Offline</span>
                                    </td>
                                    <td className="align-middle text-center">
                                        <span className="text-secondary text-xs font-weight-bold">14/09/20</span>
                                    </td>
                                    <td className="align-middle">
                                        <a href="javascript:;" className="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user">
                                        Edit
                                        </a>
                                    </td>
                                    </tr>
                                </tbody>
                                </table>
                            </div>
                            
                            <div className="row ms-3">
                                <div className="col-md-12 mb-3">
                                    <a className="btn bg-gradient-dark me-2" href="/residents/new" >
                                        <i className="material-icons opacity-10 me-2">add</i>
                                        Add New Resident
                                    </a>
                                </div>
                            </div>

                        </div>
                    </div>
                    </div>
                </div>
                        
                <Footer/>
                </div>
            </main>
        </>
    );
}
export default Residents;