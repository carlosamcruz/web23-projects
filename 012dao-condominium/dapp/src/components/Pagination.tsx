import { Link, useLocation } from "react-router-dom";

type Props = {
    count: number;
    pageSize: number;
}

function Pagination(props: Props){

    function useQuery(){
        return new URLSearchParams(useLocation().search);
    }

    const query = useQuery();

    const pageQty = Math.ceil(props.count / props.pageSize);
    const pages = [];

    for(let i=1; i<=pageQty; i++)
        pages.push(i);

    console.log("pages: ", pages.length)

    function getPageLink(page: number){
        return `${window.location.pathname}?page=${page}`;
    }
    function getBottom(){
        if(props.count > 0)
            return(
                <div className="fw-normal small mt-4 mt-lg-0">
                    <b>
                        {props.count}
                    </b> result(s).
                </div>    
            );
        else
            return(
                <div className="fw-normal small mt-4 mt-lg-0">
                    <b>
                        No result found!
                    </b> Create one first.
                </div>    
            );
    }
    function getPageClassName(page: number){
        console.log("page: ", page);
        const queryPage = parseInt(query.get("page") || "1");
        console.log("queryPage: ", queryPage);
        const isActive = queryPage === page || (!queryPage && page === 1)
        return isActive?"page-item active":"page-item";
    }

    return(
        <div className="card-footer px-3 border-0 d-flex flex-column flex-lg-row align-items-center justify-content-between">
            <nav aria-label="Page navigation example">
                <ul className="pagination mb-0">
                    {
                        pages && pages.length
                        ? pages.map(page => 
                            <li key={page} className={getPageClassName(page)}>
                                <Link className="page-link" to={getPageLink(page)}>{page}</Link>
                            </li>
                        )
                        :<></>
                    }
                </ul>
            </nav>
            {getBottom()}
        </div>
    );
}

export default Pagination;