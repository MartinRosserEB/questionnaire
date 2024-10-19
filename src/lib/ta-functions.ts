import { randomUUID } from "crypto";
import type { AnswerForEvaluation, CategoriesForEvaluation, CategoriesForEvaluationSum, CategoryForEvaluationSum, ResultSetForEvaluation } from "./custom-types";
import { getCategoriesAndSubCategoriesForCategories, getCategoriesForResultSet, getQuestionIDsForResultSet, getQuestionIDsNotInIDListAndCategory, getResultSetForEvaluation } from "./db-functions";
import type { PercentItem, ResultSet, SumItem } from '@prisma/client';
import prisma from '$lib/prisma';

export const evaluateResult = async (result: ResultSet) : Promise<void> => {
	const categories = await getCategoriesForResultSet(result.id);
	const completelyAnsweredCategoryIds: string[] = [];
	const questionsIds = (await getQuestionIDsForResultSet(result.id)).answers.map(elem => elem.question.id);
	for(const category of categories) {
		const remainingQuestions = await getQuestionIDsNotInIDListAndCategory(questionsIds, category.id);
		if (remainingQuestions.length == 0) {
			completelyAnsweredCategoryIds.push(category.id);
		}
	};
	if (completelyAnsweredCategoryIds.length > 0) {
		const categoryInfo = await getCategoriesAndSubCategoriesForCategories(categories.map(elem => elem.id));
		const resultSetForEvaluation = await getResultSetForEvaluation(result.id);
		const results = evaluateResultSet(resultSetForEvaluation, categoryInfo);
		const sumItems : SumItem[] = [] as SumItem[];
		const percentItems: PercentItem[] = [] as PercentItem[];
		results.forEach(resItem => {
			if (typeof completelyAnsweredCategoryIds.find(elem => elem == resItem.categoryId) !== 'undefined') {
				resItem.subCategories.forEach(subCategory => {
					if (subCategory.percent !== null) {
						percentItems.push({
							id: randomUUID(),
							categoryId: resItem.categoryId,
							subCategoryId: subCategory.id,
							resultSetId: result.id,
							value: subCategory.percent
						});
					}
					if (subCategory.sum !== null) {
						sumItems.push({
							id: randomUUID(),
							categoryId: resItem.categoryId,
							subCategoryId: subCategory.id,
							resultSetId: result.id,
							value: subCategory.sum
						});
					}
				});
			}
		});
		await prisma.sumItem.createMany({
			data: sumItems
		});
		await prisma.percentItem.createMany({
			data: percentItems
		});
	}
}

export const evaluateResultSet = (resultSet: ResultSetForEvaluation, categories: CategoriesForEvaluation) : CategoriesForEvaluationSum => {
    const resultCategories: CategoriesForEvaluationSum = [] as CategoriesForEvaluationSum;
    categories.forEach(category => {
        resultCategories.push({
            categoryId: category.id,
            resultSetName: resultSet.name,
            label: category.label,
            subCategories: []
        });
        category.subCategories.forEach(subCategory => {
            resultCategories[resultCategories.length - 1].subCategories.push({
                id: subCategory.id,
                label: subCategory.label,
                sum: null,
                percent: null
            });
        });
    });

    resultSet.answers.forEach(answer => {
        if (typeof answer.question.mappedByScaleItem === 'undefined' || answer.question.mappedByScaleItem === null) {
            addAnswerToSubCategory(resultCategories, answer);
        }
    });

    const egogrammCategory = categories.find(elem => elem.label === 'Egogramm');
    if (egogrammCategory) {
        const egogrammResult = resultCategories.find(elem => elem.categoryId === egogrammCategory.id);
        if (egogrammResult) {
            normalizeEgogramm(egogrammResult);
        }
    }

    return resultCategories;
}

function addAnswerToSubCategory(resultCategories: CategoriesForEvaluationSum, answer: AnswerForEvaluation) {
    const resCat = resultCategories.find(elem => elem.categoryId === answer.question.category.id);
    const resSubCat = resCat?.subCategories.find(elem => elem.id === answer.question.subCategoryId);
    if (typeof resSubCat !== 'undefined') {
        if (resSubCat.sum === null) {
            resSubCat.sum = answer.scaleItem.value;
        } else {
            resSubCat.sum += answer.scaleItem.value;
        }
    }

}

function normalizeEgogramm(resultCategory: CategoryForEvaluationSum) {
    const normalizeArray = {
        normalizingValues: [95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5],
        subCategories: [
            // labels must match the database content for this to work. See datadump_prep.sql
            {
                label: "Kritisches Eltern-Ich",
                values: [21, 20, 18, 16, 14, 12, 11, 9, 7, 5, 3]
            },
            {
                label: "Fürsorgliches Eltern-Ich",
                values: [28, 25, 22, 20, 18, 16, 14, 12, 10, 7, 5]
            },
            {
                label: "Erwachsenen-Ich",
                values: [38, 36, 33, 31, 29, 26, 23, 21, 18, 16, 14]
            },
            {
                label: "Freies Kind-Ich",
                values: [17, 15, 13, 12, 10, 9, 8, 7, 5, 3, 2]
            },
            {
                label: "Angepasstes Kind-Ich",
                values: [17, 15, 13, 12, 10, 9, 8, 7, 5, 3, 2]
            }
        ]
    };

    for (let i = 10; i > -1; i--) {
        resultCategory.subCategories.forEach(subCategory => {
            const subCatNormalize = normalizeArray.subCategories.find(elem => elem.label === subCategory.label);
            if (typeof subCatNormalize !== 'undefined' && subCategory.sum !== null && subCategory.sum >= subCatNormalize?.values[i]) {
                subCategory.percent = normalizeArray.normalizingValues[i];
            } 
        })
    }
}
