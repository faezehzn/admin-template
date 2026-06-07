import { applyConflictResolution, getUnresolvedConflicts } from "./planner";
import { PlanPrismaType, PromptFn, Question } from "./types";

export async function resolvePlanConflictsInteractively(
  plan: PlanPrismaType,
  prompt: PromptFn,
) {
  const unresolved = getUnresolvedConflicts(plan);

  for (let i = 0; i < unresolved.length; i++) {
    const conflict = unresolved[i];

    if (conflict.severity === "error") {
      // blocking errors should be thrown by caller before interactive phase
      continue;
    }

    if (conflict.type === "opposite_field_exists") {
      console.log(`\n⚠️ Conflict: ${conflict.message}`);

      const { action } = await prompt([
        {
          type: "select",
          name: "action",
          message: `How do you want to resolve field "${conflict.fieldName}" in "${conflict.targetModel}"?`,
          choices: [
            { title: "Rename opposite field", value: "rename_field" },
            { title: "Skip opposite field insertion", value: "skip" },
          ],
        },
      ]);

      if (action === "skip") {
        applyConflictResolution(plan, {
          conflictIndex: plan.conflicts.indexOf(conflict),
          action: "skip",
        });
        continue;
      }

      const renameAnswer = await prompt([
        {
          type: "text",
          name: "newFieldName",
          message: "Enter a new opposite field name:",
          validate: (v: string) =>
            /^[A-Za-z_][A-Za-z0-9_]*$/.test(v)
              ? true
              : "Invalid Prisma field name.",
        },
      ]);

      applyConflictResolution(plan, {
        conflictIndex: plan.conflicts.indexOf(conflict),
        action: "rename_field",
        newFieldName: renameAnswer.newFieldName as string,
      });
    }

    if (conflict.type === "relation_ambiguity") {
      console.log(`\n⚠️ Conflict: ${conflict.message}`);
      console.log(
        `Existing relations in "${conflict.targetModel}" to "${conflict.currentModelName}":`,
      );
      for (const rel of conflict.existingRelations || []) {
        console.log(`- ${rel.rawLine}`);
      }

      const { action } = await prompt([
        {
          type: "select",
          name: "action",
          message: `How do you want to resolve ambiguous relation "${conflict.fieldName}"?`,
          choices: [
            { title: "Set relation name only", value: "set_relation_name" },
            {
              title: "Rename field and set relation name",
              value: "rename_and_set_relation_name",
            },
            { title: "Skip opposite field insertion", value: "skip" },
          ],
        },
      ]);

      if (action === "skip") {
        applyConflictResolution(plan, {
          conflictIndex: plan.conflicts.indexOf(conflict),
          action: "skip",
        });
        continue;
      }

      const questions: Question[] = [];

      if (action === "rename_and_set_relation_name") {
        questions.push({
          type: "text",
          name: "newFieldName",
          message: "Enter a new opposite field name:",
          validate: (v: string) =>
            /^[A-Za-z_][A-Za-z0-9_]*$/.test(v)
              ? true
              : "Invalid Prisma field name.",
        });
      }

      questions.push(
        {
          type: "text",
          name: "relationName",
          message: "Enter relation name:",
          validate: (v: string) =>
            /^[A-Za-z_][A-Za-z0-9_]*$/.test(v)
              ? true
              : "Invalid relation name.",
        },
        {
          type: "select",
          name: "oppositeArity",
          message: "Should the opposite side be a single relation or list?",
          choices: [
            { title: "Single", value: "single" },
            { title: "List", value: "list" },
          ],
        },
      );

      const answers = await prompt(questions);

      applyConflictResolution(plan, {
        conflictIndex: plan.conflicts.indexOf(conflict),
        action: action as string,
        newFieldName: answers.newFieldName as string,
        relationName: answers.relationName as string,
        oppositeArity: answers.oppositeArity as string,
      });
    }
  }

  return plan;
}
