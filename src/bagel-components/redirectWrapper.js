import {
    Redirect
} from "react-router-dom";
import {useEffect} from "react";

export function RedirectWrapper(params) {
    useEffect(() => {
        window.location.href = params.to;
    }, [])

    return(
        <div className="modal" style={{display:"block"}}>
            <div className={"redirect-off-page"}>
                <div className={"redirect-center"}>
                    <div className="outer-circle-redirect">
                        <div className="load-redirect"></div>
                    </div>
                </div>

                <p>
                    Redirecting to Github.
                </p>
            </div>


        </div>
    );
}