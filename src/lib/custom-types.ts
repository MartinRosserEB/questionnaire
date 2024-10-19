export type Question = {
    id: string,
    category: string,
    subcategory: string,
    value: number
};

export type AnswerWithoutResultSetReference = {
    id: string,
    questionId: string,
    scaleItemId: string
}

export type ResultData = [
    {
        antreiber: [
            {
                id: number,
                name: string,
                text: string,
                sum: number
            }
        ],
        egogramm: [
            {
                id: number,
                name: string,
                text: string,
                sum: number,
                percent: number
            }
        ],
        dramadreieck: [
            {
                id: number,
                name: string,
                text: string,
                sum: number
            }
        ]
    }
];

export type NumberArray = number[];
export type StringArray = string[];
export type ChartArray = ChartObject[];
export type ChartObject = {
    name: string,
    values: number[]
};

export type Result = {
    id: string,
    description: string
};

export type ResultArray = [Result];

export type Team = {
    id: string,
    name: string
};

export type TeamArray = [Team];

export type TeamResult = {
    id: string,
    name: string | null;
    sumItems: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: number;
        resultSetId: string;
        categoryId: string;
        subCategoryId: string | null;
    }[];
    percentItems: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: number;
        resultSetId: string;
        categoryId: string;
        subCategoryId: string | null;
    }[];
    categories: {
        id: string;
        label: string;
    }[];
};

export type ResultGraphLabel = string[]; // x-axis bar names in chart

export type ResultGraphDataSet = { // chart content
    datasetId: string,
    label: string, // name of the dataset
    data: number[],
    backgroundColor?: string[] // currently, autocolor is used: https://github.com/kurkle/chartjs-plugin-autocolors
};

export type ResultGraphDataSets = ResultGraphDataSet[];

export type PlotResult = {
    categoryId: string,
    categoryLabel: string,
    plotLabels: ResultGraphLabel,
    plotData: ResultGraphDataSets
}[];

export type ResultSet = {
    id: string,
    category: {
        id: string,
        label: string
    },
    label: ResultGraphLabel,
    dataSets: ResultGraphDataSets
};

export type ResultSets = ResultSet[];

export type AnswerForEvaluation = {
    "scaleItem": {
        "value": number
    },
    "question": {
        "category": {
            id: string,
            label: string
        }
        "subCategoryId": string | null,
        "mappedByScaleItem": {
            id: string,
            scaleItemId: string,
            subCategoryId: string
        } | null
    }
}

export type ResultSetForEvaluation =  {
    "id": string,
    "name": string | null,
    "userId": string,
    "answers": AnswerForEvaluation[]
};

export type CategoryForEvaluation = {
    "id": string,
    "label": string,
    "subCategories": {
        "id": string,
        "label": string,
        "categoryId": string
    }[]
};

export type CategoriesForEvaluation = CategoryForEvaluation[];

export type CategoryForEvaluationSum = {
    "categoryId": string,
    "resultSetName": string | null,
    "label": string,
    "subCategories": {
        "id": string,
        "label": string,
        "sum": number | null,
        "percent": number | null
    }[]
};

export type CategoriesForEvaluationSum = CategoryForEvaluationSum[];

export type ResultItem = {
    "categoryId": string,
    "subCategoryId": string | null,
    "value": number
};

export type AnswerItem = {
    "id": string,
    "questionId": string,
    "scaleItem": {
        "id": string,
        "value": number
    }
};

export type FullResultSet = [
    {
        "id": string,
        "name": string | null,
        "userId": string,
        "answers": AnswerItem[],
        "percentItems": ResultItem[],
        "sumItems": ResultItem[]
    }
]