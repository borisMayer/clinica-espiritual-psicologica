/** Rosenberg scoring support for the standard 10-item order, four response categories.
 * Responses are 0..3 in direction of agreement (0=strongly disagree, 3=strongly agree).
 * Positive items: 1,3,4,7,10. Negative items: 2,5,6,8,9.
 * Sum 0..30, higher reflects greater self-esteem. No diagnostic cutoffs.
 * Do not apply to differently ordered or coded editions without manual verification.
 */
export const RSES_POSITIVE=[1,3,4,7,10] as const
export const RSES_REVERSED=[2,5,6,8,9] as const
export function scoreRosenberg(responses:ReadonlyArray<number|null>):number|null{
 if(responses.length!==10||responses.some(v=>v===null||!Number.isInteger(v)||v<0||v>3))return null
 return responses.reduce<number>((sum,value,index)=>sum+(RSES_REVERSED.includes((index+1) as 2|5|6|8|9)?3-value!:value!),0)
}
