import type { User } from '@auth/sveltekit';
import prisma from '$lib/prisma';
import type { Answer, Category } from '@prisma/client';

export async function retrieveOrCreateUser(user: User) {
    if (user.email !== null && typeof user.email !== 'undefined') {
        const existingUserId = await prisma.user.findUnique({ 
            where: {
                email: user.email
            }
        });
        if (existingUserId !== null) {
            return existingUserId.id;
        } else {
            const createdUser = await prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email
                }
            });
            if (createdUser)  {
                return createdUser.id;
            } else {
                throw new Error("Could not create new user.");
            }
        }
    } else {
        throw new TypeError("retrieveOrCreateUser must be called with user having an email address.")
    }
}

export async function createTeam(userId: string, team: {id: string, name: string}) {
    const createdTeam = await prisma.team.create({
        data: {
            id: team.id,
            name: team.name,
            users: {
                create: {
                    sendMail: true,
                    invitationAccepted: true,
                    isOwner: true,
                    user: {
                        connect: {
                            id: userId
                        }
                    }
                }   
            }
        }
    });
    if (createdTeam) {
        return createdTeam.id;
    } else {
        throw new Error("Could not create new team.");
    }
}

export async function acceptInvitationsForUserInTeam(userId: string, teamId: string) {
    return await prisma.usersOnTeams.update({
        data: {
            invitationAccepted: true
        },
        where: {
            userId_teamId: {
                userId: userId,
                teamId: teamId
            }
        }
    });
}

export async function listUsersFromTeam(userId: string, teamId: string) {
    return await prisma.team.findFirstOrThrow({
        select: {
            users: {
                select: {
                    invitationAccepted: true,
                    sendMail: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    }
                }
            }
        },
        where: {
            id: teamId
        }
    });
}

export async function userIsInTeam(userId: string, teamId: string) {
    return await prisma.usersOnTeams.findUniqueOrThrow({
        select: {
            isOwner: true
        },
        where: {
            usersOnTeamsId: {
                teamId: teamId,
                userId: userId
            }
        }
    });
}

export async function addUserToTeam(email: string, teamId: string) {
    return await prisma.usersOnTeams.create({
        data: {
            sendMail: true,
            invitationAccepted: false,
            team: {
                connect: {
                    id: teamId
                }
            },
            user: {
                connectOrCreate: {
                    where: {
                        email: email
                    },
                    create: {
                        email: email,
                        name: email
                    }
                }
            }
        }
    });
}

export async function removeUserFromTeam(userId: string, teamId: string) {
    return await prisma.usersOnTeams.deleteMany({
        where: {
            AND: [
                {
                    teamId: teamId
                },
                {
                    userId: userId
                },
                {
                    isOwner: false
                }
            ]
        }
    });
}

export async function deleteTeam(teamId: string) {
    const deleteUsersOnTeam = prisma.usersOnTeams.deleteMany({
        where: {
            team: {
                id: teamId
            }
        }
    });

    const deleteTeam = prisma.team.delete({
        where: {
            id: teamId
        }
    });

    return await prisma.$transaction([deleteUsersOnTeam, deleteTeam]);
}

export async function checkResultIsInTeam(result: string, team: string) {
    return await prisma.team.findFirstOrThrow({
        where: {
            id: team
        }
    }).resultSets({
        where: {
            id: result
        }
    });
}

export async function updateMailSendOfUserInTeam(userId: string, teamId: string, mail: boolean) {
    return await prisma.usersOnTeams.update({
        where: {
            usersOnTeamsId: {
                teamId: teamId,
                userId: userId
            }
        },
        data: {
            sendMail: mail
        }
    });
}

export async function removeResultFromTeam(resultId: string, teamId: string) {
    return await prisma.team.update({
        where: {
            id: teamId
        },
        data: {
            resultSets: {
                disconnect: {
                    id: resultId
                }
            }
        }
    });
}

export async function addResultToTeam(result: string, team: string) {
    return await prisma.team.update({
        select: {
            resultSets: true
        },
        where: {
            id: team
        },
        data: {
            resultSets: {
                connect: {
                    id: result
                }
            }
        }
    });
}

export async function getQuestions() {
    return await prisma.question.findMany();
}

export async function getQuestionIDsForResultSet(resultSetId: string) {
    return await prisma.resultSet.findFirstOrThrow({
        select: {
            answers: {
                select: {
                    question: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        },
        where: {
            id: resultSetId
        }
    });
}

/**
 * This function can be used to identify all unanswered question
 * 
 * @param iDList 
 * @param resultSetId 
 * @returns 
 */
export async function getQuestionIDsNotInIDListAndCategory(iDList: string[], categoryId: string) {
    return await prisma.question.findMany({
        select: {
            id: true
        },
        where: {
            AND: [
                {
                    id: {
                        notIn: iDList
                    }
                    
                },
                {
                    categoryId: categoryId
                }
            ]
        }
    })
}

export async function getCategories() {
    return await prisma.category.findMany({
        include: {
            subCategories: true
        }
    });
}

export async function getCategoriesAndSubCategoriesForCategories(categoryIds: string[]) {
    return await prisma.category.findMany({
        include: {
            subCategories: true
        },
        where: {
            id: {
                in: categoryIds
            }
        }
    });
}

export async function getScaleItems() {
    return await prisma.scaleItem.findMany();
}

export async function getResultSetById(resultSetId: string) {
    return await prisma.resultSet.findFirst({
        select: {
            id: true,
            name: true,
            userId: true,
            categories: {
                select: {
                    id: true,
                    label: true
                }
            },
            answers: {
                select: {
                    id: true,
                    questionId: true,
                    scaleItem: {
                        select: {
                            id: true,
                            value: true
                        }
                    }
                }
            },
            percentItems: {
                select: {
                    categoryId: true,
                    subCategoryId: true,
                    value: true
                }
            },
            sumItems: {
                select: {
                    categoryId: true,
                    subCategoryId: true,
                    value: true
                }
            }
        },
        where: {
            AND: [
                {
                    id: resultSetId
                },
                {
                    userId: null
                }
            ]
        }
    });
}

export async function getResultSetsForUser(userId: string) {
    return await prisma.resultSet.findMany({
        select: {
            id: true,
            name: true,
            userId: true,
            categories: {
                select: {
                    id: true,
                    label: true
                }
            },
            answers: {
                select: {
                    id: true,
                    questionId: true,
                    scaleItem: {
                        select: {
                            id: true,
                            value: true
                        }
                    }
                }
            },
            percentItems: {
                select: {
                    categoryId: true,
                    subCategoryId: true,
                    value: true
                }
            },
            sumItems: {
                select: {
                    categoryId: true,
                    subCategoryId: true,
                    value: true
                }
            }
        },
        where: {
            userId: userId
        }
    });
}

export async function getResultsForTeam(teamId: string, userId: string) {
    return await prisma.team.findFirstOrThrow({
        where: {
            AND: [
                {
                    id: teamId
                },
                {
                    users: {
                        some: {
                            user: {
                                id: userId
                            }
                        }
                    }
                }
            ]
        }
    }).resultSets({
        select: {
            id: true,
            name: true,
            categories: true,
            sumItems: true,
            percentItems: true
        }
    });
}

export async function getResultSetForUser(userId: string, resultSetId: string) {
    return await prisma.resultSet.findFirstOrThrow({
        select: {
            id: true,
            name: true,
            userId: true,
            categories: {
                select: {
                    id: true
                }
            },
            answers: {
                select: {
                    id: true,
                    questionId: true,
                    scaleItem: {
                        select: {
                            id: true,
                            value: true
                        }
                    }
                }
            },
            percentItems: {
                select: {
                    categoryId: true,
                    subCategoryId: true,
                    value: true
                }
            },
            sumItems: {
                select: {
                    categoryId: true,
                    subCategoryId: true,
                    value: true
                }
            }
        },
        where: {
            AND: [
                {
                    userId: userId
                },
                {
                    id: resultSetId
                }
            ]
        }
    })
}

export async function getResultSetForEvaluation(resultSetId: string) {
    return await prisma.resultSet.findFirstOrThrow({
        include: {
            answers: {
                select: {
                    scaleItem: {
                        select: {
                            value: true
                        }
                    },
                    question: {
                        select: {
                            category: {
                                select: {
                                    id: true,
                                    label: true // needed because evaluation is based on category label
                                }
                            },
                            subCategoryId: true,
                            mappedByScaleItem: true
                        }
                    }
                }
            }
        },
        where: {
            id: resultSetId
        }
    });
}

export async function getResultSetForEvaluationForUser(userId: string, resultSetId: string) {
    return await prisma.resultSet.findFirstOrThrow({
        include: {
            answers: {
                select: {
                    scaleItem: {
                        select: {
                            value: true
                        }
                    },
                    question: {
                        select: {
                            category: {
                                select: {
                                    id: true,
                                    label: true // needed because evaluation is based on category label
                                }
                            },
                            subCategoryId: true,
                            mappedByScaleItem: true
                        }
                    }
                }
            }
        },
        where: {
            AND: [
                {
                    id: resultSetId
                },
                {
                    userId: userId
                }
            ]
        }
    });
}

export async function getCategoriesForResultSet(resultSetId: string) {
    return await prisma.category.groupBy({
        by: ['id'],
        where: {
            questions: {
                some: {
                    answers: {
                        some: {
                            resultSetId: resultSetId
                        }
                    }       
                }
            }
        }
    });
}

export async function getAnsweredQuestionsInResultSet(resultSetId: string) {
    return await prisma.resultSet.findFirst({
        select: {
            answers: {
                select: {
                    question: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        },
        where: {
            id: resultSetId
        }
    });
}

export async function createEmptyResultSet(resultSetId: string, categories: Category[], name: string) {
    return await prisma.resultSet.create({
        select: {
            id: true
        },
        data: {
            id: resultSetId,
            name: name,
            categories: {
                connect: categories
            }
        }
    });
}

export async function createEmptyResultSetForUser(resultSetId: string, categories: Category[], name: string, user: string) {
    return await prisma.resultSet.create({
        select: {
            id: true
        },
        data: {
            id: resultSetId,
            name: name,
            user: {
                connect: {
                    id: user
                }
            },
            categories: {
                connect: categories
            }
        }
    });
}

export async function addAnswersToResultSet(resultSetId: string, answers: Answer[]) {
    return await prisma.resultSet.update({
        where: {
            id: resultSetId
        },
        data: {
            answers: {
                createMany: {
                    data: answers
                }
            }
        }
    })
}

export async function getTeamsForUser(userId: string) {
    return await prisma.user.findFirstOrThrow({
        select: {
            teams: {
                select: {
                    team: {
                        select: {
                            id: true,
                            name: true,
                            users: {
                                select: {
                                    userId: true,
                                    isOwner: true
                                }
                            }
                        }
                    }
                }
            }
        },
        where: {
            id: userId
        }
    });
}

export async function getOwnersForTeam(teamId: string) {
    return await prisma.team.findFirstOrThrow({
        select: {
            id:true,
            name: true,
            users: {
                select: {
                    isOwner: true,
                    invitationAccepted: true,
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
        where: {
            id: teamId
        }
    });
}

export async function getOpenInvitationsForUser(userId: string) {
    return await prisma.team.findMany({
        where: {
            users: {
                every: {
                    AND: [
                        {
                            userId: userId
                        },
                        {
                            invitationAccepted: false
                        }
                    ]
                }
            }
        }
    });
}