import type { Category, Question, ResultSet } from "@prisma/client";
import type { CategoriesForEvaluation, TeamArray } from "./custom-types";

export const MAIL_SENDER_ROLE = 'team_mail_sender';
export const CONFIGURATION_ROLE = 'configuration';

export async function loadUserResults() : Promise<ResultSet | undefined> {
    const response = await fetch('/api/resultset');
    const tmpRes = await response.json();
    if (Array.isArray(tmpRes?.data)) {
        return tmpRes.data as ResultSet;
    }
}

export async function loadUserResult(resultId: string) : Promise<ResultSet | undefined> {
    const response = await fetch('/api/resultset/'+resultId);
    const tmpRes = await response.json();
    if (Array.isArray(tmpRes?.data) && tmpRes.data.length > 0) {
        return tmpRes.data[0] as ResultSet;
    }
}

export async function evaluateResultSet(resultSetId: string) : Promise<CategoriesForEvaluation | undefined> {
    const queryParams = new URLSearchParams({ resultSetId: resultSetId });
    const response = await fetch('/api/resultset/evaluate?'+queryParams.toString());
    const responseJson = await response.json();
    if (Array.isArray(responseJson?.data)) {
        return responseJson.data as CategoriesForEvaluation;
    }
}

export async function loadUserTeams() : Promise<TeamArray | undefined> {
    const response = await fetch('/api/user/teams');
    const tmpRes = await response.json();
    if (Array.isArray(tmpRes?.results)) {
        return tmpRes.results as TeamArray;
    }
}

export function filterQuestionsByCategoryInCategories(questionList: Question[], allCategories: Category[]): Question[] {
    return questionList.filter(elem => {
        return typeof allCategories.find(cat => cat.id === elem.categoryId) !== 'undefined';
    });
}
