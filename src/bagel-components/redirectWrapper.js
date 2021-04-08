import {useEffect} from "react";

/**
 * Provides a wrapper around a redirect to redirect to outside websites.
 * @param {Object} params - React params.
 * @param {String} params.to - the link to redirect to
 * @param {String} params.locationName - The location name to display
 * @returns {Object} - The redirect modal
 */
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
                    Redirecting to {params.locationName}.
                </p>
            </div>


        </div>
    );
}