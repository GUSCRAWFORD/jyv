/**
 * Fundamental OData query structure
 */
export class ExpressLikeODataQuery {
    /**
     * OData $filter=<expression>
     */
    $filter?:string;
    /**
     * OData $select=<field>[,<field>,..]
     */
    $select?:string;
    /**
     * OData $skip=<number>
     */
    $skip?:string;
    /**
     * OData $top=<number>
     */
    $top?:string;
    /**
     * OData $orderby=<field>[ desc|asc]
     */
    $orderby?:string;
};