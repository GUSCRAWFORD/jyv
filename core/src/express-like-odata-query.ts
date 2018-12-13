/**
 * Fundamental OData query structure
 */
export class ExpressLikeODataQuery {
    $filter?:string;
    $select?:string;
    $skip?:string;
    $top?:string;
    $orderby?:string;
};