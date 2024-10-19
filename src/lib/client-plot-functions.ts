import type { PlotResult } from "./custom-types";
import { Prisma } from '@prisma/client'
import type { getCategories, getResultSetForUser } from "./db-functions";

type ResultSetForUser = Prisma.PromiseReturnType<typeof getResultSetForUser>
type CategoriesWithSubcategories = Prisma.PromiseReturnType<typeof getCategories>

/**
 * Function creates data format required for ResultGraph and puts it in evaluatedResultSets.
 * 
 * This function does not take care of reactivity.
 * 
 * @param resultSet 
 * @param evaluatedResultSets 
 * @param categories 
 */
export const prepareAndDistributeResultSet = async(resultSet: ResultSetForUser, evaluatedResultSets: PlotResult[], categories: CategoriesWithSubcategories) => {
    categories.forEach(category => {
        const labels = category.subCategories.map(subCat => { return subCat.label; });
        let curValues = resultSet.sumItems.filter(sumItem => sumItem.categoryId === category.id);
        const curPValues = resultSet.percentItems.filter(percentItem => percentItem.categoryId === category.id);
        if (curPValues.length > 0) {
            curValues = curPValues;
        }
        if (curValues.length > 0) {
            const curValueNbrArray = curValues.map(pItems => { return pItems.value; });
            const curCategory = evaluatedResultSets.find(evalResSet => evalResSet.categoryId === category.id);
            if (curCategory) {
                curCategory.plotData.push({
                    datasetId: resultSet.id,
                    data: curValueNbrArray,
                    label: resultSet.name ? resultSet.name : ''
                });
            } else {
                evaluatedResultSets.push({
                    categoryId: category.id,
                    categoryLabel: category.label,
                    plotLabels: labels,
                    plotData: [
                        {
                            datasetId: resultSet.id,
                            data: curValueNbrArray,
                            label: resultSet.name ? resultSet.name : ''
                        }
                    ]
                });
            }
        }
    });
}
