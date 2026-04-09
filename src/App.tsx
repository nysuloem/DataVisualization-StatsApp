import React, { useMemo, useState } from "react";

type Goal = "" | "groups" | "relationship" | "linear_model" | "categories" | "one_sample" | "ordinal_groups" | "ordinal_relationship" | "ordinal_reference" | "ordinal_model";
type Shape = "" | "symmetric" | "skewed" | "outliers" | "linear" | "nonlinear";
type RelationshipMode = "" | "association" | "scaling";
type IvGroups = "" | "2" | "3plus";
type NumFactors = "" | "one" | "two";
type Pairing = "" | "independent" | "paired" | "one_sample" | "mixed";
type YesNo = "" | "yes" | "no";
type PairwiseType = "" | "allpairs" | "vscontrol" | "planned";
type Software = "" | "prism" | "r";

type CategoryMode = "" | "independence" | "goodness";

type DataType = "" | "continuous" | "categorical" | "ordinal";

type Answers = {
  question: string;
  questionSubmitted: boolean;
  multipleTests: YesNo;
  numTests: string;
  dataType: DataType;
  goal: Goal;
  shape: Shape;
  relationshipMode: RelationshipMode;
  categoryMode: CategoryMode;
  ivGroups: IvGroups;
  numFactors: NumFactors;
  pairing: Pairing;
  needsPairwise: YesNo;
  pairwiseType: PairwiseType;
  anovaSignificant: YesNo;
  software: Software;
};

type TestKey =
  | "unpaired_t"
  | "mann_whitney"
  | "paired_t"
  | "wilcoxon"
  | "anova"
  | "kruskal"
  | "rm_anova"
  | "friedman"
  | "correlation"
  | "spearman"
  | "scaling_model"
  | "linear_model"
  | "chisq"
  | "chisq_gof"
  | "one_sample_t"
  | "one_sample_wilcoxon"
  | "two_way_anova"
  | "mixed_anova";

type TestDef = {
  title: string;
  when: string;
  assumptions: string[];
  prism: string[];
  rSteps: string[];
  rCode: string;
};

type PlotHelp = {
  title: string;
  text: string;
  note: string;
  prism: string[];
};

const TESTS: Record<TestKey, TestDef> = {
  unpaired_t: {
    title: "Unpaired t test",
    when: "Compare a continuous outcome between TWO independent groups.",
    assumptions: [
      "I am comparing TWO groups",
      "Samples are independent",
      "Outcome is a continuous value, not category totals",
      "Data are not extremely skewed or dominated by outliers",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose t tests.",
      "Choose Unpaired t test.",
      "Choose Parametric.",
      "Run the analysis and read the p-value.",
    ],
    rSteps: ["Create two vectors, one for each group.", "Run the t test.", "Read the p-value."],
    rCode: `group1 <- c(12.1, 11.8, 13.0, 12.5)
group2 <- c(10.4, 10.9, 11.1, 10.7)

t.test(group1, group2)`,
  },
  mann_whitney: {
    title: "Mann-Whitney test",
    when: "Compare a continuous outcome between TWO independent groups when the data are skewed or outlier-heavy.",
    assumptions: [
      "I am comparing TWO groups",
      "Samples are independent",
      "Each data point comes from an individual sample",
      "The data are skewed or dominated by outliers",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose t tests (and nonparametric tests).",
      "Choose Mann-Whitney test.",
      "Choose Nonparametric.",
      "Run the analysis and read the p-value.",
    ],
    rSteps: ["Create two vectors, one for each group.", "Run the Mann-Whitney test.", "Read the p-value."],
    rCode: `group1 <- c(12.1, 11.8, 13.0, 12.5)
group2 <- c(10.4, 10.9, 11.1, 10.7)

wilcox.test(group1, group2)`,
  },
  paired_t: {
    title: "Paired t test",
    when: "Compare TWO measurements from the same sample, animal, or person.",
    assumptions: [
      "I am comparing TWO conditions",
      "The same samples, animals, or people were measured in both conditions",
      "Outcome is a continuous value, not category totals",
      "Data are not extremely skewed or dominated by outliers",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose t tests.",
      "Choose Paired t test.",
      "Choose Parametric.",
      "Run the analysis and read the p-value.",
    ],
    rSteps: ["Create one vector for each condition.", "Make sure paired values are in matching positions.", "Run the paired t test."],
    rCode: `before <- c(78, 80, 76, 81)
after  <- c(72, 75, 73, 77)

t.test(before, after, paired = TRUE)`,
  },
  wilcoxon: {
    title: "Wilcoxon signed-rank test",
    when: "Compare TWO repeated measurements from the same sample, animal, or person when the data are skewed or outlier-heavy.",
    assumptions: [
      "I am comparing TWO conditions",
      "The same samples, animals, or people were measured in both conditions",
      "Each data point comes from an individual sample",
      "The data are skewed or dominated by outliers",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose t tests (and nonparametric tests).",
      "Choose Wilcoxon matched-pairs signed-rank test.",
      "Choose Nonparametric.",
      "Run the analysis and read the p-value.",
    ],
    rSteps: ["Create one vector for each condition.", "Make sure paired values are in matching positions.", "Run the Wilcoxon signed-rank test."],
    rCode: `before <- c(78, 80, 76, 81)
after  <- c(72, 75, 73, 77)

wilcox.test(before, after, paired = TRUE)`,
  },
  anova: {
    title: "One-way ANOVA",
    when: "Compare a continuous outcome across THREE OR MORE independent groups.",
    assumptions: [
      "I have 3 or more groups",
      "Samples are independent",
      "Outcome is a continuous value, not category totals",
      "Data are not extremely skewed or dominated by outliers",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose One-way ANOVA.",
      "Choose Parametric.",
      "Inspect the overall ANOVA result first.",
      "If needed, add the post hoc test recommended above.",
    ],
    rSteps: ["Create a data frame with one column for the outcome and one for the group.", "Fit the ANOVA model.", "View the ANOVA table."],
    rCode: `outcome <- c(10.2, 10.8, 11.0, 12.1, 12.4, 11.9, 13.2, 13.5, 13.1)
group <- c("A", "A", "A", "B", "B", "B", "C", "C", "C")

df <- data.frame(outcome, group)
model <- aov(outcome ~ group, data = df)
summary(model)
TukeyHSD(model)`,
  },
  kruskal: {
    title: "Kruskal-Wallis test",
    when: "Compare a continuous outcome across THREE OR MORE independent groups when the data are skewed or outlier-heavy.",
    assumptions: [
      "I have 3 or more groups",
      "Samples are independent",
      "Each data point comes from an individual sample",
      "The data are skewed or dominated by outliers",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose One-way ANOVA (and nonparametric tests).",
      "Choose Kruskal-Wallis test.",
      "Choose Nonparametric.",
      "Run the analysis and read the p-value.",
    ],
    rSteps: ["Create a data frame with one column for the outcome and one for the group.", "Run the Kruskal-Wallis test.", "Read the p-value."],
    rCode: `outcome <- c(10.2, 10.8, 11.0, 12.1, 12.4, 11.9, 13.2, 13.5, 13.1)
group <- c("A", "A", "A", "B", "B", "B", "C", "C", "C")

df <- data.frame(outcome, group)
kruskal.test(outcome ~ group, data = df)`,
  },
  rm_anova: {
    title: "Repeated-measures one-way ANOVA",
    when: "Compare a continuous outcome across THREE OR MORE conditions when the same sample, animal, or person is measured each time.",
    assumptions: [
      "I have 3 or more conditions or time points",
      "The same samples were measured repeatedly",
      "Outcome is a continuous value, not category totals",
      "Data are not extremely skewed or dominated by outliers",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose One-way ANOVA.",
      "Choose Repeated measures.",
      "Choose Parametric.",
      "Inspect the overall result first.",
    ],
    rSteps: ["Put the data into long format with subject, condition, and outcome columns.", "Fit a repeated-measures ANOVA model.", "Inspect the ANOVA table."],
    rCode: `subject   <- c(1,1,1, 2,2,2, 3,3,3)
condition <- c("A","B","C", "A","B","C", "A","B","C")
outcome   <- c(72, 68, 65, 75, 70, 69, 78, 74, 71)

df <- data.frame(subject, condition, outcome)
model <- aov(outcome ~ condition + Error(subject/condition), data = df)
summary(model)`,
  },
  friedman: {
    title: "Friedman test",
    when: "Compare a continuous outcome across THREE OR MORE repeated conditions when the data are skewed or outlier-heavy.",
    assumptions: [
      "I have 3 or more conditions or time points",
      "The same samples were measured repeatedly",
      "Each data point comes from an individual sample",
      "The data are skewed or dominated by outliers",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose Repeated measures (and nonparametric tests).",
      "Choose Friedman test.",
      "Choose Nonparametric.",
      "Run the analysis and read the p-value.",
    ],
    rSteps: ["Put the data into long format with subject, condition, and outcome columns.", "Run the Friedman test.", "Read the p-value."],
    rCode: `subject   <- c(1,1,1, 2,2,2, 3,3,3)
condition <- c("A","B","C", "A","B","C", "A","B","C")
outcome   <- c(72, 68, 65, 75, 70, 69, 78, 74, 71)

df <- data.frame(subject, condition, outcome)
friedman.test(outcome ~ condition | subject, data = df)`,
  },
  correlation: {
    title: "Correlation (Pearson)",
    when: "Test whether TWO continuous variables are related.",
    assumptions: [
      "I have two continuous variables",
      "I am analyzing the relationship between the two variables, not comparing groups",
      "The scatterplot looks roughly like a straight-line trend",
      "There are no extreme outliers dominating the pattern",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose Correlation.",
      "Choose Pearson.",
      "Run the analysis and read the correlation coefficient and p-value.",
    ],
    rSteps: ["Create one vector for X and one for Y.", "Run the correlation test.", "Read the correlation coefficient and p-value."],
    rCode: `x <- c(2, 4, 6, 8, 10)
y <- c(3, 5, 6, 9, 11)

cor.test(x, y)`,
  },
  spearman: {
    title: "Correlation (Spearman)",
    when: "Test whether TWO variables are associated when the scatterplot is messy, non-linear, or outlier-heavy.",
    assumptions: [
      "I have two measured variables",
      "I am testing a relationship, not comparing groups",
      "A non-parametric approach is safer because the pattern is messy or outlier-heavy",
      "I want a rank-based association rather than a strictly linear Pearson approach",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose Correlation.",
      "Choose Spearman.",
      "Run the analysis and read the correlation coefficient and p-value.",
    ],
    rSteps: ["Create one vector for X and one for Y.", "Run the Spearman correlation test.", "Read the correlation coefficient and p-value."],
    rCode: `x <- c(2, 4, 6, 8, 10)
y <- c(3, 5, 6, 9, 11)

cor.test(x, y, method = "spearman")`,
  },
  scaling_model: {
    title: "Scaling relationship (power model / exponent)",
    when: "Use this when you want a scaling coefficient or exponent.",
    assumptions: [
      "I have two measured variables",
      "I want a scaling coefficient or exponent",
      "A power relationship is biologically reasonable",
    ],
    prism: [
      "Use your existing XY dataset (scatterplot already created).",
      "Click Analyze.",
      "Choose Nonlinear regression (curve fit).",
      "If you see a built-in 'Power' model (sometimes under Lines), select it. If not, click 'New' → 'User-defined equation' and enter: Y = a * X^b.",
      "Run the fit.",
      "After the fit, look at the Results sheet (not the graph).",
      "Find the fitted parameters table — this will list values for a and b.",
      "The exponent b is your scaling exponent (this is the key value you report).",
    ],
    rSteps: ["Create one vector for X and one for Y.", "Log-transform both variables.", "Fit a linear model to the transformed values."],
    rCode: `# Option 1: power model using nls
body_mass <- c(1.2, 1.8, 2.6, 3.5, 5.1)
conduction_velocity <- c(0.9, 1.1, 1.3, 1.5, 1.8)

model <- nls(conduction_velocity ~ a * body_mass^b, start = list(a = 1, b = 1))
summary(model)

# Option 2: log-log linear model
log_mass <- log(body_mass)
log_velocity <- log(conduction_velocity)

lm_model <- lm(log_velocity ~ log_mass)
summary(lm_model)`,
  },
  linear_model: {
    title: "Linear model",
    when: "Use this when you want to know which combination of continuous and/or categorical variables predicts or explains a single continuous outcome.",
    assumptions: [
      "Outcome is a continuous value, not category totals",
      "Observations are independent",
      "Predictors can be continuous, categorical, or a mix",
    ],
    prism: [
      "GraphPad Prism 11 is usually not the best starting point for a general linear model with multiple predictors.",
      "For this kind of analysis, R is usually the better choice in this course.",
    ],
    rSteps: ["Create a data frame with one outcome column and one column for each predictor.", "Fit the linear model.", "Use summary() to read the coefficients and p-values."],
    rCode: `outcome    <- c(12.1, 11.8, 13.0, 12.5, 10.9, 11.4)
predictor1 <- c("A", "A", "B", "B", "A", "B")
predictor2 <- c(4.2, 3.9, 5.1, 4.8, 3.7, 4.9)

df <- data.frame(outcome, predictor1, predictor2)
model <- lm(outcome ~ predictor1 + predictor2, data = df)
summary(model)

# Key things to read in the summary() output:
#
# Coefficients table — one row per predictor:
#   Estimate   = the effect size (how much outcome changes per unit of predictor)
#   Pr(>|t|)   = the p-value for that predictor  ← focus here
#
# Multiple R-squared = how much variance in outcome is explained by the model
#
# Example output snippet:
# Coefficients:
#               Estimate Std. Error t value Pr(>|t|)
# (Intercept)    10.950      0.412   26.57  0.00014 ***
# predictor1B     1.067      0.337    3.17  0.03362 *    ← predictor1 is significant
# predictor2      0.412      0.089    4.63  0.00971 **   ← predictor2 is significant
#
# Multiple R-squared: 0.89  ← model explains 89% of variance`,
  },
  two_way_anova: {
    title: "Two-way ANOVA",
    when: "Test the effects of two independent categorical variables on a continuous outcome, and whether their effects interact with each other. All individuals contribute data to only one combination of the two variables.",
    assumptions: [
      "I have one continuous outcome variable",
      "I have exactly two independent categorical variables, each with two or more levels",
      "All observations are independent — different individuals in every combination of levels",
      "Data are not extremely skewed or dominated by outliers",
    ],
    prism: [
      "With your existing Grouped dataset open, click Analyze.",
      "Choose Two-way ANOVA.",
      "Leave repeated measures off — all data are independent.",
      "Run the analysis.",
      "Read the interaction term p-value first before interpreting anything else.",
    ],
    rSteps: [
      "Create a data frame with columns for the outcome and each independent variable.",
      "Fit the two-way ANOVA model using aov() with both variables and their interaction.",
      "Read the ANOVA table — check the interaction term first.",
      "If the interaction is significant, use emmeans to test simple effects.",
    ],
    rCode: `library(emmeans)

# Replace variable names and values with your own
outcome  <- c(12.1, 11.8, 13.0, 12.5, 10.9, 11.4, 14.2, 13.8, 15.1, 14.5, 13.2, 13.9)
variable1 <- c("A","A","A", "A","A","A", "B","B","B", "B","B","B")
variable2 <- c("X","X","X", "Y","Y","Y", "X","X","X", "Y","Y","Y")

df <- data.frame(outcome, variable1, variable2)
model <- aov(outcome ~ variable1 * variable2, data = df)
summary(model)

# If interaction is significant, test simple effects:
emm <- emmeans(model, ~ variable2 | variable1)
pairs(emm, adjust = "tukey")`,
  },
  mixed_anova: {
    title: "Mixed-design two-way ANOVA",
    when: "Test the effects of two independent variables on a continuous outcome, where one variable separates different individuals into groups (independent grouping variable) and the other variable consists of conditions or time points that every individual experienced (repeated-measures variable).",
    assumptions: [
      "I have one continuous outcome variable",
      "One independent variable separates different individuals into distinct groups — no individual appears in more than one group",
      "The other independent variable consists of conditions or time points that the same individuals experienced repeatedly",
      "Data are not severely skewed — this test is fairly robust to mild non-normality but breaks down with extreme skew or outliers",
    ],
    prism: [
      "With your existing Grouped dataset open, click Analyze.",
      "Choose Two-way ANOVA.",
      "Under 'Repeated measures', select 'Repeated measures in one factor'.",
      "Specify that the row factor is the repeated-measures variable.",
      "Run the analysis.",
      "Read the interaction term p-value first before interpreting anything else.",
    ],
    rSteps: [
      "Create a long-format data frame with columns for: subject ID, the independent grouping variable, the repeated-measures variable, and the outcome.",
      "Fit the mixed ANOVA model using aov() with an Error() term for the repeated-measures variable.",
      "Inspect the summary — read the interaction term first.",
      "If the interaction is significant, use emmeans to test simple effects.",
    ],
    rCode: `library(emmeans)

# Long-format data frame — replace variable names and values with your own
subject    <- c(1,1,1, 2,2,2, 3,3,3, 4,4,4)
group      <- c("A","A","A", "A","A","A", "B","B","B", "B","B","B")   # independent grouping variable
condition  <- c("C1","C2","C3", "C1","C2","C3",
                "C1","C2","C3", "C1","C2","C3")                        # repeated-measures variable
outcome    <- c(224, 252, 226, 210, 194, 216, 181, 125, 156, 152, 164, 152)

df <- data.frame(subject = factor(subject), group, condition, outcome)

# Mixed ANOVA
model <- aov(outcome ~ group * condition + Error(subject/condition), data = df)
summary(model)

# If interaction is significant, test simple effects:
emm <- emmeans(model, ~ condition | group)
pairs(emm, adjust = "tukey")`,
  },
  one_sample_t: {
    title: "One-sample t test",
    when: "Test whether the mean of your measurements is significantly different from a specific expected or hypothesized value (such as zero, or a known population mean).",
    assumptions: [
      "I have one set of continuous measurements",
      "I am comparing my measurements against a fixed reference value, not against another group",
      "Each measurement comes from an independent sample",
      "Data are not extremely skewed or dominated by outliers",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose Column analyses → One-sample t test and Wilcoxon test.",
      "Enter the hypothesized mean value you are testing against (e.g. 0).",
      "Choose Parametric (one-sample t test).",
      "Run the analysis and read the p-value and confidence interval.",
    ],
    rSteps: [
      "Create a vector of your measurements.",
      "Run the one-sample t test, specifying the hypothesized mean with mu =.",
      "Read the p-value and confidence interval.",
    ],
    rCode: `# Replace with your actual values and hypothesized mean
measurements <- c(0.75, 1.31, 0.52, 0.84, 0.60)
hypothesized_mean <- 0   # e.g. testing whether activity is greater than zero

t.test(measurements, mu = hypothesized_mean)`,
  },
  one_sample_wilcoxon: {
    title: "One-sample Wilcoxon signed-rank test",
    when: "Test whether the median of your measurements is significantly different from a specific expected or hypothesized value, when the data are skewed or dominated by outliers.",
    assumptions: [
      "I have one set of continuous measurements",
      "I am comparing my measurements against a fixed reference value, not against another group",
      "Each measurement comes from an independent sample",
      "The data are skewed or dominated by outliers, making a non-parametric test more appropriate",
    ],
    prism: [
      "With your existing dataset open, click Analyze.",
      "Choose Column analyses → One-sample t test and Wilcoxon test.",
      "Enter the hypothesized median value you are testing against (e.g. 0).",
      "Choose Nonparametric (Wilcoxon signed-rank test).",
      "Run the analysis and read the p-value.",
    ],
    rSteps: [
      "Create a vector of your measurements.",
      "Run the one-sample Wilcoxon signed-rank test, specifying the hypothesized median with mu =.",
      "Read the p-value.",
    ],
    rCode: `# Replace with your actual values and hypothesized median
measurements <- c(0.75, 1.31, 0.52, 0.84, 0.60)
hypothesized_median <- 0   # e.g. testing whether activity is greater than zero

wilcox.test(measurements, mu = hypothesized_median)`,
  },
  chisq: {
    title: "Chi-square test of independence",
    when: "Test whether two categorical variables are associated — i.e. whether the distribution of counts across one category depends on which level of the other category you are looking at.",
    assumptions: [
      "Data are counts, not continuous measurements",
      "I have two categorical variables that cross each other (e.g. size × colour)",
      "Observations are independent",
      "Expected counts in each cell are at least 5",
    ],
    prism: [
      "With your existing contingency table open, click Analyze.",
      "Choose Contingency table analyses.",
      "Choose Chi-square test.",
      "Run the analysis and read the p-value.",
    ],
    rSteps: ["Create a matrix of counts with rows = one variable, columns = the other.", "Run the chi-square test of independence.", "Read the p-value."],
    rCode: `# Rows = size (large, small), Columns = colour (red, blue)
tab <- matrix(c(14, 9, 11, 16), nrow = 2, byrow = TRUE)
rownames(tab) <- c("large", "small")
colnames(tab) <- c("red", "blue")

chisq.test(tab)`,
  },
  chisq_gof: {
    title: "Chi-square goodness-of-fit test",
    when: "Test whether the observed counts for a single categorical variable match an expected distribution (e.g. 50/50, or some other ratio you specify).",
    assumptions: [
      "Data are counts of individuals falling into categories",
      "I have only ONE categorical variable",
      "I want to compare observed counts to an expected ratio or distribution",
      "Observations are independent",
      "Expected counts in each category are at least 5",
    ],
    prism: [
      "Click New Table & Graph.",
      "Select Column.",
      "Enter the observed count for each category in a single column (one row per category).",
      "Click Analyze.",
      "Choose Chi-square goodness-of-fit test (under Frequency distributions or Column analyses depending on your Prism version).",
      "Enter the expected proportions or counts when prompted (e.g. 0.5 and 0.5 for a 50/50 expectation).",
      "Run the analysis and read the p-value.",
    ],
    rSteps: [
      "Create a vector of observed counts, one value per category.",
      "Specify the expected proportions (must sum to 1).",
      "Run the chi-square goodness-of-fit test.",
      "Read the p-value.",
    ],
    rCode: `# Example: testing whether large vs. small crayfish are 50/50
observed <- c(34, 16)   # replace with your counts
expected_proportions <- c(0.5, 0.5)   # replace with your expected ratio

chisq.test(observed, p = expected_proportions)`,
  },
};

const INITIAL_ANSWERS: Answers = {
  question: "",
  questionSubmitted: false,
  multipleTests: "",
  numTests: "",
  dataType: "",
  goal: "",
  shape: "",
  relationshipMode: "",
  categoryMode: "",
  ivGroups: "",
  numFactors: "",
  pairing: "",
  needsPairwise: "",
  pairwiseType: "",
  anovaSignificant: "",
  software: "",
};

function decisionEngine(a: Answers): TestKey | null {
  const nonParametric = a.shape === "skewed" || a.shape === "outliers" || a.shape === "nonlinear";

  if (a.goal === "one_sample") {
    if (!a.shape) return null;
    return nonParametric ? "one_sample_wilcoxon" : "one_sample_t";
  }

  // Ordinal goals — route directly to non-parametric equivalents
  if (a.goal === "ordinal_reference") return "one_sample_wilcoxon";
  if (a.goal === "ordinal_relationship") return "spearman";
  if (a.goal === "ordinal_model") return "linear_model"; // pragmatic choice flagged in assumptions
  if (a.goal === "ordinal_groups") {
    if (!a.pairing || !a.ivGroups) return null;
    if (a.pairing === "mixed") return "mixed_anova"; // best available
    if (a.ivGroups === "2" && a.pairing === "independent") return "mann_whitney";
    if (a.ivGroups === "2" && a.pairing === "paired") return "wilcoxon";
    if (a.ivGroups === "3plus" && a.pairing === "independent") {
      if (a.numFactors === "two") return "two_way_anova";
      if (!a.numFactors) return null;
      return "kruskal";
    }
    if (a.ivGroups === "3plus" && a.pairing === "paired") return "friedman";
  }

  if (a.goal === "groups") {
    if (a.pairing === "one_sample") return a.shape ? "one_sample_t" : null;
    if (a.pairing === "mixed") return a.shape ? "mixed_anova" : null;
    if (!a.ivGroups || !a.pairing || !a.shape) return null;
    if (a.ivGroups === "2" && a.pairing === "independent") return nonParametric ? "mann_whitney" : "unpaired_t";
    if (a.ivGroups === "2" && a.pairing === "paired") return nonParametric ? "wilcoxon" : "paired_t";
    if (a.ivGroups === "3plus" && a.pairing === "independent") {
      if (a.numFactors === "two") return "two_way_anova";
      if (!a.numFactors) return null;
      return nonParametric ? "kruskal" : "anova";
    }
    if (a.ivGroups === "3plus" && a.pairing === "paired") return nonParametric ? "friedman" : "rm_anova";
  }

  if (a.goal === "relationship") {
    if (!a.relationshipMode || !a.shape) return null;
    if (a.relationshipMode === "association") return nonParametric ? "spearman" : "correlation";
    if (a.relationshipMode === "scaling") return "scaling_model";
  }

  if (a.goal === "linear_model") return "linear_model";
  if (a.goal === "categories") {
    if (a.categoryMode === "independence") return "chisq";
    if (a.categoryMode === "goodness") return "chisq_gof";
    return null;
  }
  return null;
}

function postHocRecommendation(resultKey: TestKey | null, pairwiseType: PairwiseType) {
  if (!pairwiseType) return null;
  if (resultKey === "anova") {
    if (pairwiseType === "allpairs") return { title: "Recommended post hoc: Tukey", text: "Use Tukey when you want to compare all groups with all other groups after a one-way ANOVA." };
    if (pairwiseType === "vscontrol") return { title: "Recommended post hoc: Dunnett", text: "Use Dunnett when you want to compare each group against one control group." };
    if (pairwiseType === "planned") return { title: "Recommended post hoc: Bonferroni", text: "Use Bonferroni when you have a small number of planned comparisons." };
  }
  if (resultKey === "rm_anova") {
    if (pairwiseType === "allpairs") return { title: "Recommended post hoc: Šídák or Bonferroni", text: "For repeated-measures ANOVA, Prism commonly offers Šídák or Bonferroni." };
    if (pairwiseType === "vscontrol") return { title: "Recommended post hoc: compare each condition to baseline/control", text: "Choose the option that compares each condition to the control while correcting for multiple comparisons." };
    if (pairwiseType === "planned") return { title: "Recommended post hoc: Bonferroni", text: "Use Bonferroni when you only have a limited set of planned repeated-measures comparisons." };
  }
  return null;
}

function plotRecommendation(goal: Goal, pairing: Pairing, categoryMode: CategoryMode = "", numFactors: NumFactors = ""): PlotHelp | null {
  // Map ordinal goals to their equivalent continuous plot
  const effectiveGoal = goal === "ordinal_groups" ? "groups"
    : goal === "ordinal_relationship" ? "relationship"
    : goal === "ordinal_model" ? "linear_model"
    : goal === "ordinal_reference" ? "one_sample"
    : goal;
  if (effectiveGoal === "one_sample") {
    return {
      title: "Recommended plot: Dot-Bar Plot (single group)",
      text: "Because you are testing one set of measurements against a fixed reference value, display all your data points in a single column with a mean and SD bar. Add a horizontal reference line at the hypothesized value (e.g. zero) so readers can visually judge how far your data are from it.",
      note: "Each row should contain one measurement from one independent sample.",
      prism: [
        "Click New Table & Graph.",
        "Select Column.",
        "Choose Enter or import data into a new table.",
        "Choose Enter replicate values, stacked into columns.",
        "Enter a column name (e.g. 'Amylase Activity per g') at the top.",
        "Enter each measurement in the rows below.",
        "Go to Graph: Data 1 and choose the option for individual data points with Mean and SD.",
        "To add a reference line: double-click the graph → go to the Add menu → Add Reference Line → set it to your hypothesized value (e.g. 0).",
      ],
    };
  }

  if (effectiveGoal === "groups") {
    if (numFactors === "two") {
      return {
        title: "Recommended plot: Grouped plot (Column table)",
        text: "Because you have two independent variables, use a Grouped table in Prism. One variable defines the column groupings and the other defines the rows. This layout lets readers see both main effects and any interaction pattern at a glance.",
        note: "Figure tip: show individual data points with mean and SD bars.",
        prism: [
          "Click New Table & Graph.",
          "Select Grouped.",
          "Under Options, select Enter replicate values in side-by-side subcolumns.",
          "Set the number of subcolumn replicates to match the number of individuals in your largest group.",
          "Label the column groups with the levels of one independent variable.",
          "Label the row groups with the levels of the other independent variable.",
          "Enter each individual's measurement in the appropriate subcolumn cell.",
          "Go to Graph: Data 1 and choose a grouped dot plot showing individual points with Mean and SD.",
        ],
      };
    }
    if (pairing === "mixed") {
      return {
        title: "Recommended plot: Grouped plot (Grouped table)",
        text: "Because you have one independent grouping variable and one repeated-measures variable, use a Grouped table in Prism. The independent grouping variable defines the columns, and the repeated-measures variable defines the rows.",
        note: "Figure tip: show individual data points with mean and SD bars.",
        prism: [
          "Click New Table & Graph.",
          "Select Grouped.",
          "Under Options, select Enter replicate values in side-by-side subcolumns.",
          "Set the number of subcolumn replicates to match the number of individuals in your largest independent group.",
          "Label the column groups with the levels of your independent grouping variable (e.g. Group A, Group B).",
          "Label the row groups with the levels of your repeated-measures variable (e.g. Condition 1, Condition 2, Condition 3).",
          "Enter each individual's measurements — the same individual's values must appear in the same subcolumn position across all rows.",
          "Go to Graph: Data 1 and choose a grouped dot plot showing individual points with Mean and SD.",
        ],
      };
    }
    const pairedChosen = pairing === "paired";
    const independentChosen = pairing === "independent";
    return {
      title: "Recommended plot: Dot-Bar Plot",
      text: "Because you are comparing continuous values across groups or conditions, a dot-bar plot shows every individual data point while also summarizing each group with a mean and variability. This lets you see both the spread of the data and the group differences at the same time.",
      note:
        pairing === ""
          ? "Important: before entering your data in Prism, decide whether your data are independent or paired/repeated."
          : pairedChosen
            ? "Important: your data are paired/repeated, so you must preserve pairing across rows."
            : "Important: your data are independent, so each group is entered separately.",
      prism: pairedChosen
        ? [
            "Click New Table & Graph.",
            "Select Column.",
            "Choose Enter or import data into a new table.",
            "Choose Enter paired or repeated values into rows.",
            "Enter the GROUP NAME at the top of each column.",
            "Enter matched or repeated values across the same row so the pairing is preserved.",
            "Go to Graph: Data 1.",
            "Under Graph: Data 1, choose the option for individual data points with Mean and SD.",
          ]
        : [
            "Click New Table & Graph.",
            "Select Column.",
            "Choose Enter or import data into a new table.",
            independentChosen
              ? "Choose Enter replicate values, stacked into columns."
              : "Choose replicate values (columns) unless data are paired.",
            "Enter the GROUP NAME at the top of each column.",
            "Enter all measured values for that group in the spaces below that column.",
            "Go to Graph: Data 1.",
            "Under Graph: Data 1, choose the option for individual data points with Mean and SD.",
          ],
    };
  }

  if (effectiveGoal === "relationship") {
    return {
      title: "Recommended plot: Scatterplot",
      text: "Because you are examining the relationship between two continuous variables, a scatterplot is the best way to show how one variable changes with the other and whether the pattern looks linear or curved.",
      note: "",
      prism: [
        "Click New Table & Graph.",
        "Select XY.",
        "Choose Enter and plot a single Y value for each point.",
        "Enter X values in the X column and Y values in the Y column.",
        "Click Graph: Data 1 and choose a graph type that shows only individual points (scatterplot), not bars or summaries.",
      ],
    };
  }

  if (effectiveGoal === "linear_model") {
    return {
      title: "Recommended plots: exploratory plots",
      text: "Plot the outcome against each predictor separately.",
      note: "",
      prism: [
        "Use an XY table and scatterplot for continuous predictors.",
        "Use a Column table and Dot-Bar Plot for categorical predictors.",
        "Make a separate exploratory plot for each predictor before fitting the model.",
      ],
    };
  }

  if (effectiveGoal === "categories" && categoryMode === "independence") {
    return {
      title: "Recommended plot: bar graph of counts (contingency table)",
      text: "Because your data are counts crossing two categorical variables, display them as a grouped bar graph built from a contingency table. Each cell in the table contains the number of observations in that combination of categories. Categorical count data are always independent: the same individual cannot be counted in more than one cell.",
      note: "",
      prism: [
        "Click New Table & Graph.",
        "Select Contingency.",
        "Label the rows and columns with your category names.",
        "Enter the count (number of observations) directly into each cell — do not enter raw measurements.",
        "Prism will automatically offer a bar graph of the counts.",
      ],
    };
  }

  if (effectiveGoal === "categories" && categoryMode === "goodness") {
    return {
      title: "Recommended plot: bar graph of observed vs. expected counts",
      text: "Because you are testing one categorical variable against an expected distribution, display the observed counts as a bar graph and indicate the expected counts for comparison. Observations are always independent in this design.",
      note: "",
      prism: [
        "Click New Table & Graph.",
        "Select Column.",
        "Label each row with a category name (e.g. Large, Small).",
        "Enter the observed count for each category in the first data column.",
        "Create a bar graph from these counts.",
        "You can add a second column for expected counts to show both bars side by side.",
      ],
    };
  }

  return null;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function ButtonChoice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded border p-4 text-left transition ${selected ? "bg-slate-900 text-white" : "bg-white hover:border-slate-500"}`}
    >
      {children}
    </button>
  );
}

function CodeBox({ code }: { code: string }) {
  return (
    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-4 text-sm text-white">
      <code>{code}</code>
    </pre>
  );
}

export default function App() {
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [checked, setChecked] = useState<number[]>([]);
  const [showPlotHelp, setShowPlotHelp] = useState(false);
  const [showPlotHelp2, setShowPlotHelp2] = useState(false);

  const updateAnswers = (patch: Partial<Answers>) => {
    const changesAffectingRecommendedTest = ["dataType", "goal", "shape", "relationshipMode", "categoryMode", "ivGroups", "numFactors", "pairing"].some((key) =>
      Object.prototype.hasOwnProperty.call(patch, key)
    );
    const isSoftwareOnly = Object.keys(patch).length === 1 && Object.prototype.hasOwnProperty.call(patch, "software");
    if (changesAffectingRecommendedTest && !isSoftwareOnly) setChecked([]);

    setAnswers((prev) => {
      const next: Answers = { ...prev, ...patch };

      if (Object.prototype.hasOwnProperty.call(patch, "dataType")) {
        next.goal = "";
        next.shape = "";
        next.relationshipMode = "";
        next.categoryMode = "";
        next.ivGroups = "";
        next.numFactors = "";
        next.pairing = "";
        next.needsPairwise = "";
        next.pairwiseType = "";
        next.software = "";
      }

      if (Object.prototype.hasOwnProperty.call(patch, "goal")) {
        next.shape = "";
        next.relationshipMode = "";
        if (!Object.prototype.hasOwnProperty.call(patch, "categoryMode")) {
          next.categoryMode = "";
        }
        next.ivGroups = "";
        next.numFactors = "";
        next.pairing = "";
        next.needsPairwise = "";
        next.pairwiseType = "";
        next.software = "";
      }

      if (Object.prototype.hasOwnProperty.call(patch, "ivGroups")) {
        next.numFactors = "";
        next.needsPairwise = "";
        next.pairwiseType = "";
        next.software = "";
      }

      if (Object.prototype.hasOwnProperty.call(patch, "numFactors")) {
        next.needsPairwise = "";
        next.pairwiseType = "";
        next.software = "";
      }

      if (Object.prototype.hasOwnProperty.call(patch, "categoryMode")) {
        next.software = "";
      }

      if (Object.prototype.hasOwnProperty.call(patch, "shape")) {
        next.needsPairwise = "";
        next.pairwiseType = "";
        next.software = "";
      }

      if (Object.prototype.hasOwnProperty.call(patch, "relationshipMode")) {
        next.software = "";
      }

      if (Object.prototype.hasOwnProperty.call(patch, "pairing")) {
        next.needsPairwise = "";
        next.pairwiseType = "";
        next.software = "";
      }

      if (Object.prototype.hasOwnProperty.call(patch, "needsPairwise")) {
        next.pairwiseType = "";
        next.anovaSignificant = "";
        next.software = "";
      }

      if (Object.prototype.hasOwnProperty.call(patch, "pairwiseType")) {
        next.anovaSignificant = "";
        next.software = "";
      }

      if (Object.prototype.hasOwnProperty.call(patch, "anovaSignificant")) {
        next.software = "";
      }

      return next;
    });
  };

  const plot = useMemo(() => plotRecommendation(answers.goal, answers.pairing, answers.categoryMode, answers.numFactors), [answers.goal, answers.pairing, answers.categoryMode, answers.numFactors]);
  const resultKey = useMemo(() => decisionEngine(answers), [answers]);
  const result = resultKey ? TESTS[resultKey] : null;
  const postHoc = postHocRecommendation(resultKey, answers.pairwiseType);
  const allChecked = Boolean(result) && checked.length === result.assumptions.length;
  const supportsPairwise = (resultKey === "anova" || resultKey === "rm_anova");
  const supportsTwoWayPostHoc = resultKey === "two_way_anova" || resultKey === "mixed_anova";
  const canChooseSoftware = Boolean(result) && allChecked &&
    (!supportsPairwise || answers.needsPairwise === "no" ||
      (Boolean(postHoc) && (answers.anovaSignificant === "yes" || answers.anovaSignificant === "no")));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl bg-slate-900 p-6 text-white">
          <h1 className="text-3xl font-bold">BIOB32 Data Visualization & Analysis Assistant</h1>
        </div>

        <Panel title="Step 1: What is the research question that you are looking to analyze?">
          <textarea
            className="w-full rounded border p-3"
            placeholder="Example: Does temperature affect oxygen consumption in crayfish?"
            value={answers.question}
            onChange={(e) => setAnswers((prev) => ({ ...prev, question: e.target.value, questionSubmitted: false }))}
          />
          <button
            type="button"
            className="mt-3 rounded bg-slate-900 px-4 py-2 text-white"
            onClick={() => {
              if (answers.question.trim().length > 0) updateAnswers({ questionSubmitted: true });
            }}
          >
            Submit Question
          </button>

          {answers.questionSubmitted && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <strong>Are you running other related statistical tests as part of the same experiment?</strong>
              <p className="mt-1 text-slate-600">A related test asks essentially the <em>same question</em> but with one thing changed — for example, testing whether temperature affects metabolic rate in species A, and then asking the same question for species B; or comparing body mass between two groups, and then separately comparing limb length between the same groups. If your other research questions are quite different from this one — different outcome variables, different designs, or different biological questions — answer No.</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <ButtonChoice selected={answers.multipleTests === "no"} onClick={() => updateAnswers({ multipleTests: "no", numTests: "" })}>
                  <strong>No</strong>
                  <p>I am not running any other related statistical tests</p>
                </ButtonChoice>
                <ButtonChoice selected={answers.multipleTests === "yes"} onClick={() => updateAnswers({ multipleTests: "yes" })}>
                  <strong>Yes</strong>
                  <p>I am running multiple related statistical tests</p>
                </ButtonChoice>
              </div>
              {answers.multipleTests === "yes" && (
                <div className="mt-3">
                  <label className="block font-semibold">How many tests in total are you running?</label>
                  <input
                    type="number"
                    min={2}
                    className="mt-1 w-32 rounded border p-2"
                    placeholder="e.g. 6"
                    value={answers.numTests}
                    onChange={(e) => updateAnswers({ numTests: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}
        </Panel>

        {answers.questionSubmitted && (answers.multipleTests === "no" || (answers.multipleTests === "yes" && answers.numTests)) && (
          <Panel title="Step 2: Understand your data">

            {/* ── Step 2a: Variable type ── */}
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">2a</span>
              <span className="font-semibold">What is the nature of the variable(s) you measured?</span>
            </div>
            <div className="grid gap-3 text-sm">
              <ButtonChoice selected={answers.dataType === "continuous"} onClick={() => updateAnswers({ dataType: "continuous" })}>
                <strong>Continuous variables</strong>
                <p>Numerical measurements that can take any value along a scale — such as heart rate, enzyme activity, body mass, reaction time, or oxygen consumption</p>
              </ButtonChoice>
              <ButtonChoice selected={answers.dataType === "ordinal"} onClick={() => updateAnswers({ dataType: "ordinal" })}>
                <strong>Ordinal / rating scale variables</strong>
                <p>Scores on a numbered scale where the categories are ordered but the spacing between them may not be equal — such as a pain rating from 1–10, a behavioural score, or a Likert-scale response</p>
              </ButtonChoice>
              <ButtonChoice selected={answers.dataType === "categorical"} onClick={() => updateAnswers({ dataType: "categorical" })}>
                <strong>Categorical count variables</strong>
                <p>Tallies of how many observations fall into each discrete category — such as the number of animals displaying a behaviour, the number of cells in each phase of the cell cycle, or the number of organisms in each size class</p>
              </ButtonChoice>
            </div>

            {/* ── Step 2b: Analytical goal ── */}
            {answers.dataType && (
              <>
                <div className="my-4 border-t border-slate-200" />
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">2b</span>
                  <span className="font-semibold">What do you want to analyze about these variables?</span>
                </div>

                {answers.dataType === "continuous" && (
                  <div className="grid gap-3 text-sm">
                    <ButtonChoice selected={answers.goal === "groups"} onClick={() => updateAnswers({ goal: "groups" })}>
                      <strong>Compare groups or conditions</strong>
                      <p>Test whether the measured values differ between two or more groups or conditions</p>
                    </ButtonChoice>
                    <ButtonChoice selected={answers.goal === "relationship"} onClick={() => updateAnswers({ goal: "relationship" })}>
                      <strong>Test a relationship</strong>
                      <p>Determine whether two continuous variables are related, or estimate a scaling exponent</p>
                    </ButtonChoice>
                    <ButtonChoice selected={answers.goal === "linear_model"} onClick={() => updateAnswers({ goal: "linear_model" })}>
                      <strong>Model multiple variables</strong>
                      <p>Use one continuous outcome variable and test the effect of more than one predictor</p>
                    </ButtonChoice>
                    <ButtonChoice selected={answers.goal === "one_sample"} onClick={() => updateAnswers({ goal: "one_sample" })}>
                      <strong>Test measurements against a reference value</strong>
                      <p>Test whether the mean of your measurements differs significantly from a specific expected value, such as zero or a known population mean</p>
                    </ButtonChoice>
                  </div>
                )}

                {answers.dataType === "categorical" && (
                  <div className="grid gap-3 text-sm">
                    <ButtonChoice selected={answers.goal === "categories" && answers.categoryMode === "independence"} onClick={() => updateAnswers({ goal: "categories", categoryMode: "independence" })}>
                      <strong>Test for association between two categorical variables</strong>
                      <p>Do the counts in one category depend on which level of the other category you are looking at?</p>
                    </ButtonChoice>
                    <ButtonChoice selected={answers.goal === "categories" && answers.categoryMode === "goodness"} onClick={() => updateAnswers({ goal: "categories", categoryMode: "goodness" })}>
                      <strong>Test counts against an expected ratio</strong>
                      <p>Do the observed counts in each category match a specific expected distribution, such as 50/50?</p>
                    </ButtonChoice>
                  </div>
                )}

                {answers.dataType === "ordinal" && (
                  <>
                    <div className="grid gap-3 text-sm">
                      <ButtonChoice selected={answers.goal === "ordinal_groups"} onClick={() => updateAnswers({ goal: "ordinal_groups" })}>
                        <strong>Compare groups or conditions</strong>
                        <p>Test whether scores differ between two or more groups or conditions</p>
                      </ButtonChoice>
                      <ButtonChoice selected={answers.goal === "ordinal_relationship"} onClick={() => updateAnswers({ goal: "ordinal_relationship" })}>
                        <strong>Test a relationship</strong>
                        <p>Determine whether two ordinal or ranked variables are associated</p>
                      </ButtonChoice>
                      <ButtonChoice selected={answers.goal === "ordinal_reference"} onClick={() => updateAnswers({ goal: "ordinal_reference" })}>
                        <strong>Test scores against a reference value</strong>
                        <p>Test whether the median score differs significantly from a specific expected value</p>
                      </ButtonChoice>
                      <ButtonChoice selected={answers.goal === "ordinal_model"} onClick={() => updateAnswers({ goal: "ordinal_model" })}>
                        <strong>Model multiple predictors</strong>
                        <p>Test the effect of more than one variable on an ordinal outcome — note that this requires pragmatic assumptions</p>
                      </ButtonChoice>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── Step 2c: Sample structure — only for Compare groups ── */}
            {(answers.goal === "groups" || answers.goal === "ordinal_groups") && (
              <>
                <div className="my-4 border-t border-slate-200" />
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">2c</span>
                  <span className="font-semibold">What is the nature of the groups you are comparing?</span>
                </div>
                <p className="mb-3 text-sm text-slate-600">This determines how you enter data in GraphPad Prism and which test is appropriate.</p>
                <div className="grid gap-3 text-sm">
                  <ButtonChoice selected={answers.pairing === "independent"} onClick={() => updateAnswers({ pairing: "independent" })}>
                    <strong>Independent groups</strong>
                    <p><strong>Different</strong> samples, animals, or people in each group — no sample appears in more than one group</p>
                  </ButtonChoice>
                  <ButtonChoice selected={answers.pairing === "paired"} onClick={() => updateAnswers({ pairing: "paired" })}>
                    <strong>Paired or repeated measures</strong>
                    <p>The <strong>same</strong> sample, animal, or person is measured under each condition or at each time point</p>
                  </ButtonChoice>
                  <ButtonChoice selected={answers.pairing === "mixed"} onClick={() => updateAnswers({ pairing: "mixed" })}>
                    <strong>Mixed — both independent and paired/repeated</strong>
                    <p>One grouping variable separates different samples, animals, or people; another variable consists of conditions or time points that all of them experienced</p>
                  </ButtonChoice>
                </div>
              </>
            )}

            {((answers.goal === "groups" && answers.pairing && (answers.pairing === "mixed" || answers.pairing !== "independent" || answers.ivGroups !== "3plus" || answers.numFactors)) || (answers.goal === "ordinal_groups" && answers.pairing && (answers.pairing === "mixed" || answers.pairing !== "independent" || answers.ivGroups !== "3plus" || answers.numFactors)) || answers.goal === "relationship" || answers.goal === "ordinal_relationship" || answers.goal === "linear_model" || answers.goal === "ordinal_model" || answers.goal === "one_sample" || answers.goal === "ordinal_reference" || (answers.goal === "categories" && answers.categoryMode)) && plot && (
              <>
                <div className="my-4 border-t border-slate-200" />
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">2d</span>
                  <span className="font-semibold">Recommended plot</span>
                </div>
              <div className="rounded-2xl bg-blue-700 p-4 text-white shadow-lg ring-2 ring-blue-300">
                <strong>{plot.title}</strong>
                <p className="mt-1">{plot.text}</p>
                {plot.note && <p className="mt-2 text-xs">{plot.note}</p>}
                <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm">
                  <strong>How to make this in GraphPad Prism 11:</strong>
                  {answers.goal === "groups" && (
                    <div className="mt-2 rounded-lg bg-white/10 p-3 text-xs">
                      <strong>Figure tip:</strong> For this course, show the individual data points and include a mean with error bars. Use <strong>SD</strong>.
                    </div>
                  )}
                  <ul className="mt-2 space-y-1">
                    {plot.prism.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              </>
            )}

            {(answers.goal === "linear_model" || answers.goal === "ordinal_model") && (
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  className="w-full rounded border border-slate-300 bg-white p-3 text-left text-sm hover:border-slate-500"
                  onClick={() => setShowPlotHelp((prev) => !prev)}
                >
                  <strong>{showPlotHelp ? "▾" : "▸"} Need help making a scatterplot? (for a continuous predictor)</strong>
                </button>
                {showPlotHelp && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <ul className="space-y-1">
                      <li>• Click New Table &amp; Graph.</li>
                      <li>• Select <strong>XY</strong>.</li>
                      <li>• Choose <em>Enter and plot a single Y value for each point</em>.</li>
                      <li>• Enter your predictor values in the X column and your outcome values in the Y column.</li>
                      <li>• Choose a graph type that shows only individual points (scatterplot), not bars or summaries.</li>
                    </ul>
                  </div>
                )}
                <button
                  type="button"
                  className="w-full rounded border border-slate-300 bg-white p-3 text-left text-sm hover:border-slate-500"
                  onClick={() => setShowPlotHelp2((prev) => !prev)}
                >
                  <strong>{showPlotHelp2 ? "▾" : "▸"} Need help making a dot-bar plot? (for a categorical predictor)</strong>
                </button>
                {showPlotHelp2 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <ul className="space-y-1">
                      <li>• Click New Table &amp; Graph.</li>
                      <li>• Select <strong>Column</strong>.</li>
                      <li>• Choose <em>Enter replicate values, stacked into columns</em>.</li>
                      <li>• Enter the category name at the top of each column and the outcome values below it.</li>
                      <li>• Choose the graph option that shows individual data points with mean and SD.</li>
                    </ul>
                  </div>
                )}
                <p className="text-xs text-slate-500 pt-1">Make a separate exploratory plot for each predictor before fitting the model.</p>
              </div>
            )}
          </Panel>
        )}

        {((answers.goal === "groups" && answers.pairing && answers.pairing !== "mixed") || answers.goal === "relationship" || answers.goal === "one_sample") && (
          <Panel title="Step 3: After making your plot, what does the data distribution or pattern look like?">
            {(answers.goal === "groups" || answers.goal === "one_sample") && (
              <div className="grid gap-3 text-sm md:grid-cols-3">
                <ButtonChoice selected={answers.shape === "symmetric"} onClick={() => updateAnswers({ shape: "symmetric" })}>
                  <strong>Symmetric</strong>
                  <p>Data points are balanced around the mean</p>
                </ButtonChoice>
                <ButtonChoice selected={answers.shape === "skewed"} onClick={() => updateAnswers({ shape: "skewed" })}>
                  <strong>Skewed</strong>
                  <p>Data points are clustered on one side of the mean</p>
                </ButtonChoice>
                <ButtonChoice selected={answers.shape === "outliers"} onClick={() => updateAnswers({ shape: "outliers" })}>
                  <strong>Outliers</strong>
                  <p>There are one or more extreme values</p>
                </ButtonChoice>
              </div>
            )}

            {answers.goal === "relationship" && (
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <ButtonChoice selected={answers.shape === "linear"} onClick={() => updateAnswers({ shape: "linear" })}>
                  <strong>Linear</strong>
                  <p>The points follow a fairly straight-line trend</p>
                </ButtonChoice>
                <ButtonChoice selected={answers.shape === "nonlinear"} onClick={() => updateAnswers({ shape: "nonlinear" })}>
                  <strong>Non-linear</strong>
                  <p>The pattern is curved, noisy, or dominated by unusual points</p>
                </ButtonChoice>
              </div>
            )}

            {answers.shape && (
              <div className="mt-4 text-sm">
                {(answers.shape === "symmetric" || answers.shape === "linear") && (
                  <div className="rounded bg-blue-700 p-3 text-white">
                    <strong>Parametric tests are OK</strong>
                  </div>
                )}
                {(answers.shape === "skewed" || answers.shape === "outliers" || answers.shape === "nonlinear") && (
                  <div className="rounded bg-blue-700 p-3 text-white">
                    <strong>Non-parametric tests recommended</strong>
                  </div>
                )}
              </div>
            )}
          </Panel>
        )}

        {answers.goal === "relationship" && answers.shape && (
          <Panel title="Step 4: What do you want to know about the relationship in your data?">
            <div className="space-y-4">
              <div className="rounded bg-slate-50 p-3 text-sm">
                <strong>Choose what you want from the relationship analysis:</strong>
              </div>
              <div className="grid gap-3">
                <ButtonChoice selected={answers.relationshipMode === "association"} onClick={() => updateAnswers({ relationshipMode: "association" })}>
                  <strong>Test if there is a significant relationship</strong>
                  <p>Use this if your goal is to determine whether the variables are statistically related.</p>
                </ButtonChoice>
                <ButtonChoice selected={answers.relationshipMode === "scaling"} onClick={() => updateAnswers({ relationshipMode: "scaling" })}>
                  <strong>Estimate a scaling coefficient</strong>
                  <p>Use this if you want an exponent describing how one variable scales with another.</p>
                </ButtonChoice>
              </div>
            </div>
          </Panel>
        )}

        {(answers.goal === "groups" || answers.goal === "ordinal_groups") && answers.shape && answers.pairing !== "one_sample" && answers.pairing !== "mixed" && (
          <Panel title="Step 4: How many groups or conditions are you comparing?">
            <div className="mb-4 rounded bg-amber-50 p-3 text-sm">
              <strong>What counts as a group or condition here?</strong>
              <p className="mt-1">A group or condition is one of the distinct categories you are comparing <em>in this one analysis</em>. Ask yourself: what is different between the groups? Each different treatment, time point, species, or dose counts as one group or condition. For example, if you are comparing three species, you have three groups. If you are comparing before treatment, after treatment, and a recovery period, you have three conditions.</p>
            </div>
            <div>
              <strong>How many groups or conditions?</strong>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <ButtonChoice selected={answers.ivGroups === "2"} onClick={() => updateAnswers({ ivGroups: "2" })}>Two</ButtonChoice>
                <ButtonChoice selected={answers.ivGroups === "3plus"} onClick={() => updateAnswers({ ivGroups: "3plus" })}>3+</ButtonChoice>
              </div>
            </div>

            {answers.ivGroups === "3plus" && answers.pairing === "independent" && (
              <div className="mt-4">
                <strong>How many independent variables (factors) do you have?</strong>
                <p className="mt-1 mb-3 text-slate-600 text-sm">A factor is a categorical variable whose levels define your groups. For example, sex (male/female) is one factor; treatment (Baseline/Happy/Sad) is another.</p>
                <div className="grid grid-cols-2 gap-3">
                  <ButtonChoice selected={answers.numFactors === "one"} onClick={() => updateAnswers({ numFactors: "one" })}>
                    <strong>One factor</strong>
                    <p>e.g. comparing three or more treatment groups</p>
                  </ButtonChoice>
                  <ButtonChoice selected={answers.numFactors === "two"} onClick={() => updateAnswers({ numFactors: "two" })}>
                    <strong>Two factors</strong>
                    <p>e.g. comparing treatment groups AND sex, to test whether their effects interact</p>
                  </ButtonChoice>
                </div>
              </div>
            )}
          </Panel>
        )}

        {result && (
          <Panel title="Step 5: Recommended test">
            <div className="mb-3 rounded bg-emerald-700 p-4 text-xl font-semibold text-white">{result.title}</div>
            <p className="mb-4 text-sm">{result.when}</p>
            {answers.goal === "ordinal_model" && (
              <div className="mb-4 rounded bg-amber-50 p-3 text-sm">
                <strong>Note on ordinal outcomes in a linear model:</strong> Strictly speaking, ordinal outcomes are best analysed with ordinal regression (e.g. <code>polr()</code> in R), which is beyond the scope of most undergraduate courses. Treating the rating scale as a continuous outcome in a standard linear model is a common pragmatic choice — it is acceptable when the scale has many points and the residuals are reasonably well-behaved, but should be acknowledged as a limitation.
              </div>
            )}
            {(answers.goal === "ordinal_groups" || answers.goal === "ordinal_relationship" || answers.goal === "ordinal_reference") && (
              <div className="mb-4 rounded bg-blue-50 p-3 text-sm">
                <strong>Non-parametric test selected automatically:</strong> Because your outcome is an ordinal rating scale, a non-parametric test is used — it works on the ranked order of the scores rather than their exact values, which is appropriate when equal spacing between scale points cannot be assumed.
              </div>
            )}
            <strong>Verify assumptions before proceeding:</strong>
            {result.assumptions.map((assumption, index) => (
              <label key={assumption} className="mt-1 block">
                <input
                  type="checkbox"
                  checked={checked.includes(index)}
                  onChange={(e) => {
                    if (e.target.checked) setChecked((prev) => [...prev, index]);
                    else setChecked((prev) => prev.filter((x) => x !== index));
                  }}
                />{" "}
                {assumption}
              </label>
            ))}
          </Panel>
        )}

        {result && allChecked && supportsPairwise && (
          <Panel title="Step 6: Do you need pairwise comparisons?">
            <div className="mb-4 rounded bg-slate-50 p-3 text-sm">
              <strong>What this means:</strong>
              <p className="mt-1">The overall ANOVA tells you whether there is evidence that some groups differ somewhere in the dataset. Pairwise comparisons ask which specific pairs differ.</p>
            </div>
            <div className="grid gap-3">
              <ButtonChoice selected={answers.needsPairwise === "no"} onClick={() => updateAnswers({ needsPairwise: "no" })}>
                <strong>No</strong>
                <p>I only need the overall result</p>
              </ButtonChoice>
              <ButtonChoice selected={answers.needsPairwise === "yes"} onClick={() => updateAnswers({ needsPairwise: "yes" })}>
                <strong>Yes</strong>
                <p>I need to know which specific groups or conditions differ</p>
              </ButtonChoice>
            </div>

            {answers.needsPairwise === "yes" && (
              <div className="mt-4">
                <strong>What kind of pairwise comparisons do you need?</strong>
                <div className="mt-2 grid gap-3">
                  <ButtonChoice selected={answers.pairwiseType === "allpairs"} onClick={() => updateAnswers({ pairwiseType: "allpairs" })}>
                    <strong>All pairs</strong>
                    <p>Compare every group or condition with every other one</p>
                  </ButtonChoice>
                  <ButtonChoice selected={answers.pairwiseType === "vscontrol"} onClick={() => updateAnswers({ pairwiseType: "vscontrol" })}>
                    <strong>Each group vs one control or baseline</strong>
                    <p>Compare every group or condition to one reference group</p>
                  </ButtonChoice>
                  <ButtonChoice selected={answers.pairwiseType === "planned"} onClick={() => updateAnswers({ pairwiseType: "planned" })}>
                    <strong>A small number of planned comparisons</strong>
                    <p>You only want a few specific comparisons that you decided in advance</p>
                  </ButtonChoice>
                </div>
              </div>
            )}

            {postHoc && answers.anovaSignificant === "" && (
              <div className="mt-4">
                <strong>Before choosing software: was the overall ANOVA p-value significant?</strong>
                <p className="mt-1 mb-3 text-sm text-slate-600">Run the ANOVA first, then come back and answer this before proceeding to the post hoc step.</p>
                <div className="grid grid-cols-2 gap-3">
                  <ButtonChoice selected={answers.anovaSignificant === "yes"} onClick={() => updateAnswers({ anovaSignificant: "yes" })}>
                    <strong>Yes (p &lt; 0.05)</strong>
                    <p>There is evidence that at least one group differs — proceed to post hoc</p>
                  </ButtonChoice>
                  <ButtonChoice selected={answers.anovaSignificant === "no"} onClick={() => updateAnswers({ anovaSignificant: "no" })}>
                    <strong>No (p ≥ 0.05)</strong>
                    <p>No evidence of any difference between groups</p>
                  </ButtonChoice>
                </div>
              </div>
            )}

            {postHoc && answers.anovaSignificant === "yes" && (
              <div className="mt-4 rounded bg-blue-700 p-4 text-white">
                <strong>{postHoc.title}</strong>
                <p className="mt-1">{postHoc.text}</p>
              </div>
            )}

            {postHoc && answers.anovaSignificant === "no" && (
              <div className="mt-4 rounded bg-slate-600 p-4 text-white">
                <strong>Overall ANOVA not significant — no post hoc needed</strong>
                <p className="mt-1">A non-significant ANOVA means there is not enough evidence to conclude that any groups differ from each other. Do not run post hoc tests — doing so inflates the risk of false positives. Report the overall ANOVA result and conclude that no significant differences were detected.</p>
              </div>
            )}
          </Panel>
        )}

        {canChooseSoftware && (
          <Panel title={`Step ${supportsPairwise ? "7" : "6"}: Choose software for statistical analysis`}>
            <div className="mb-3 rounded bg-slate-50 p-3 text-sm">Both options perform the same statistical idea. The choice here is about which software workflow you want to follow.</div>
            <div className="grid grid-cols-2 gap-3">
              <ButtonChoice selected={answers.software === "prism"} onClick={() => updateAnswers({ software: "prism" })}>GraphPad Prism 11</ButtonChoice>
              <ButtonChoice selected={answers.software === "r"} onClick={() => updateAnswers({ software: "r" })}>R</ButtonChoice>
            </div>
          </Panel>
        )}

        {canChooseSoftware && answers.software && result && (
          <Panel title={`Step ${supportsPairwise ? "8" : "7"}: How to do it in ${answers.software === "prism" ? "GraphPad Prism 11" : "R"}`}>
            {answers.software === "prism" ? (
              <div>
                <div className="mb-3 rounded bg-emerald-50 p-3 text-sm">
                  <strong>Important:</strong> You have already created your graph and entered your data. Now you are just running the statistical test on that existing dataset.
                </div>
                <ul className="space-y-2 text-sm">
                  {result.prism.map((step) => (
                    <li key={step}>• {step}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <div className="mb-3 rounded bg-emerald-50 p-3 text-sm">
                  <strong>Important:</strong> You have already visualized your data. Now you are testing that same dataset in R.
                </div>
                <ol className="ml-5 list-decimal space-y-2 text-sm">
                  {result.rSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <CodeBox code={result.rCode} />
              </div>
            )}

            {postHoc && answers.anovaSignificant === "yes" && (
              <div className="mt-4 rounded bg-slate-50 p-4 text-sm">
                <strong>Now run the post hoc test:</strong>
                <p className="mt-1">Because the overall ANOVA was significant and you need {answers.pairwiseType === "allpairs" ? "all pairwise comparisons" : answers.pairwiseType === "vscontrol" ? "comparisons against a control group" : "planned comparisons"}, use <strong>{postHoc.title.replace("Recommended post hoc: ", "")}</strong>.</p>
                {answers.software === "prism" && (
                  <p className="mt-2">In Prism: when the analysis options ask about multiple comparisons, select the {postHoc.title.replace("Recommended post hoc: ", "")} option.</p>
                )}
                {answers.software === "r" && (
                  <p className="mt-2">In R: after running the ANOVA, use the appropriate post hoc function as shown in the code above (TukeyHSD for Tukey, or adjust the emmeans call for other methods).</p>
                )}
              </div>
            )}

            {supportsTwoWayPostHoc && (
              <div className="mt-6 rounded bg-slate-100 p-4 text-sm ring-2 ring-slate-400">
                <strong>Now that you have run the analysis: check the interaction term first</strong>
                <p className="mt-2">Before reading anything else in your ANOVA output, find the row for the interaction term (Variable A × Variable B). Its p-value tells you whether the effect of one independent variable depends on the level of the other.</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <ButtonChoice selected={answers.needsPairwise === "no"} onClick={() => updateAnswers({ needsPairwise: "no" })}>
                    <strong>Interaction not significant (p ≥ 0.05)</strong>
                    <p>Interpret the main effects directly</p>
                  </ButtonChoice>
                  <ButtonChoice selected={answers.needsPairwise === "yes"} onClick={() => updateAnswers({ needsPairwise: "yes" })}>
                    <strong>Interaction significant (p &lt; 0.05)</strong>
                    <p>Do not interpret main effects alone — test simple effects instead</p>
                  </ButtonChoice>
                </div>
                {answers.needsPairwise === "no" && (
                  <div className="mt-3 rounded bg-blue-700 p-3 text-white">
                    <strong>No interaction:</strong> report the p-value for each main effect. If either is significant and has more than two levels, add a post hoc test (e.g. Tukey) to identify which specific groups differ.
                  </div>
                )}
                {answers.needsPairwise === "yes" && (
                  <div className="mt-3 rounded bg-blue-700 p-3 text-white">
                    <strong>Significant interaction:</strong>
                    <p className="mt-1">In Prism: go back to the analysis options → Multiple comparisons → select <em>Simple effects within rows</em> or <em>Simple effects within columns</em>.</p>
                    <p className="mt-1">In R: use the emmeans code shown above — it tests each level of one variable within each level of the other, with Tukey correction.</p>
                  </div>
                )}
              </div>
            )}

            {answers.multipleTests === "yes" && answers.numTests && Number(answers.numTests) >= 2 && (
              <div className="mt-6 rounded bg-red-50 p-4 text-sm ring-2 ring-red-300">
                <strong>⚠ Multiple comparisons correction required</strong>
                <p className="mt-1">Because you are running <strong>{answers.numTests} related tests</strong> in this experiment, there is an elevated risk of a false positive result by chance alone. You must apply a <strong>Bonferroni correction</strong>.</p>
                <p className="mt-2">Your corrected significance threshold is:</p>
                <p className="mt-1 text-center text-lg font-bold">α = 0.05 ÷ {answers.numTests} = {(0.05 / Number(answers.numTests)).toFixed(4)}</p>
                <p className="mt-2">A result is only statistically significant if <strong>p &lt; {(0.05 / Number(answers.numTests)).toFixed(4)}</strong>. Do not use p &lt; 0.05 as your threshold for any of these tests.</p>
              </div>
            )}

            <div className="mt-6 rounded bg-amber-50 p-3 text-sm">
              <strong>Showing the result on your figure:</strong>
              {(() => {
                const bonferroni = answers.multipleTests === "yes" && Number(answers.numTests) >= 2;
                const n = Number(answers.numTests);
                const alpha = bonferroni ? 0.05 / n : 0.05;
                const star1 = alpha.toFixed(4);
                const star2 = (alpha / 10).toFixed(5);
                const star3 = (alpha / 100).toFixed(6);

                const AsteriskTable = () => (
                  <li className="ml-4 mt-1 rounded bg-white p-2 font-mono text-xs leading-relaxed">
                    {bonferroni ? (
                      <>
                        <span className="block">* &nbsp;&nbsp; p &lt; {star1} &nbsp;(your Bonferroni threshold)</span>
                        <span className="block">** &nbsp; p &lt; {star2}</span>
                        <span className="block">*** &nbsp;p &lt; {star3}</span>
                        <span className="block">ns &nbsp;&nbsp; p ≥ {star1} &nbsp;(not significant)</span>
                      </>
                    ) : (
                      <>
                        <span className="block">* &nbsp;&nbsp; p &lt; 0.05</span>
                        <span className="block">** &nbsp; p &lt; 0.01</span>
                        <span className="block">*** &nbsp;p &lt; 0.001</span>
                        <span className="block">ns &nbsp;&nbsp; p ≥ 0.05 &nbsp;(not significant)</span>
                      </>
                    )}
                  </li>
                );

                // Shared SVG styles
                const svgClass = "mt-3 mb-1 w-full max-w-xs rounded border border-amber-200 bg-white p-2";

                if (resultKey === "correlation" || resultKey === "spearman" || resultKey === "scaling_model") {
                  return (
                    <ul className="mt-2 space-y-1">
                      {answers.software === "r" && resultKey === "correlation" && <li>• Take the r and r² (square the r value) and p-value from your R output.</li>}
                      {answers.software === "r" && resultKey === "spearman" && <li>• Take the ρ (rho) and p-value from your R output. Note: Spearman does not produce r², report ρ instead.</li>}
                      {answers.software === "r" && resultKey === "scaling_model" && <li>• Take the exponent (b), its standard error, and p-value from your R output.</li>}
                      {resultKey === "correlation" && <li>• <strong>If the relationship is significant:</strong> add a regression line through your data in Prism (Analyze → Linear regression). Place a text annotation in an empty area of the plot showing r² and p-value, e.g. <em>r² = 0.91, p = 0.003</em>.</li>}
                      {resultKey === "spearman" && <li>• <strong>If the relationship is significant:</strong> add a trend line if appropriate, and place a text annotation in an empty area showing ρ and p-value, e.g. <em>ρ = 0.87, p = 0.008</em>.</li>}
                      {resultKey === "scaling_model" && <li>• <strong>If the fit is significant:</strong> add the fitted curve through your data in Prism (Analyze → Nonlinear regression). Place a text annotation near the curve showing the exponent and p-value, e.g. <em>b = 0.75, p = 0.002</em>.</li>}
                      <li>• <strong>If the relationship is not significant:</strong> show the data points only — do not add a trend line. Add a brief <em>ns</em> annotation in an empty corner of the plot.</li>
                      <li>
                        <svg className="mt-3 mb-1 w-full max-w-sm rounded border border-amber-200 bg-white p-2" viewBox="0 0 420 155" xmlns="http://www.w3.org/2000/svg">
                          {/* ── Left panel: significant ── */}
                          <rect x="10" y="10" width="185" height="125" fill="white" stroke="#ccc" strokeWidth="1"/>
                          {/* data points — clear upward trend */}
                          {[[25,120],[40,105],[55,95],[70,82],[90,68],[110,55],[130,42],[150,30],[170,20]].map(([x,y],i) => (
                            <circle key={i} cx={x} cy={y} r="4" fill="#475569"/>
                          ))}
                          {/* regression line */}
                          <line x1="22" y1="124" x2="172" y2="18" stroke="#475569" strokeWidth="1.5"/>
                          {/* annotation — placed in empty lower-right space, no box */}
                          <text x="120" y="108" fontSize="7.5" fill="#475569" fontStyle="italic">r² = 0.97</text>
                          <text x="120" y="119" fontSize="7.5" fill="#475569" fontStyle="italic">p = 0.001</text>
                          {/* axis labels */}
                          <text x="5" y="75" fontSize="7.5" fill="#64748b" transform="rotate(-90,5,75)">Outcome</text>
                          <text x="102" y="148" fontSize="7.5" fill="#64748b" textAnchor="middle">Predictor</text>
                          {/* panel label */}
                          <text x="102" y="22" fontSize="8" fontWeight="bold" fill="#16a34a" textAnchor="middle">Significant</text>

                          {/* ── Right panel: not significant ── */}
                          <rect x="225" y="10" width="185" height="125" fill="white" stroke="#ccc" strokeWidth="1"/>
                          {/* data points — no clear trend */}
                          {[[240,80],[255,45],[270,100],[290,60],[310,90],[330,50],[345,75],[360,40],[375,85]].map(([x,y],i) => (
                            <circle key={i} cx={x} cy={y} r="4" fill="#94a3b8"/>
                          ))}
                          {/* no regression line — intentionally absent */}
                          {/* ns annotation in empty upper-right corner */}
                          <text x="385" y="28" fontSize="9" fill="#64748b" textAnchor="end" fontStyle="italic">ns</text>
                          {/* axis labels */}
                          <text x="220" y="75" fontSize="7.5" fill="#64748b" transform="rotate(-90,220,75)">Outcome</text>
                          <text x="317" y="148" fontSize="7.5" fill="#64748b" textAnchor="middle">Predictor</text>
                          {/* panel label */}
                          <text x="317" y="22" fontSize="8" fontWeight="bold" fill="#dc2626" textAnchor="middle">Not significant</text>
                        </svg>
                      </li>
                    </ul>
                  );
                }

                if (resultKey === "chisq" || resultKey === "chisq_gof") {
                  return (
                    <ul className="mt-2 space-y-1">
                      {answers.software === "r" && <li>• Take the χ² statistic and p-value from your R output.</li>}
                      <li>• Add an asterisk label above the relevant bar or inside the figure using the convention below.</li>
                      <li>• In the figure legend, report the full result, e.g. <em>χ²(1) = 4.23, p = 0.040</em>.</li>
                      {resultKey === "chisq_gof" && <li>• Consider adding a dashed line showing the expected count in each category.</li>}
                      <li>
                        <svg className={svgClass} viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
                          <rect x="30" y="10" width="155" height="110" fill="white" stroke="#ccc" strokeWidth="1"/>
                          <rect x="55" y="45" width="35" height="70" fill="#475569"/>
                          <rect x="115" y="70" width="35" height="45" fill="#94a3b8"/>
                          <text x="72" y="40" fontSize="11" fontWeight="bold" fill="#be123c" textAnchor="middle">*</text>
                          <text x="57" y="128" fontSize="8" fill="#64748b">Group A</text>
                          <text x="117" y="128" fontSize="8" fill="#64748b">Group B</text>
                          <text x="15" y="75" fontSize="8" fill="#64748b" transform="rotate(-90,15,75)">Count</text>
                        </svg>
                      </li>
                      <AsteriskTable />
                    </ul>
                  );
                }

                if (resultKey === "linear_model") {
                  return (
                    <ul className="mt-2 space-y-1">
                      {answers.software === "r" && <li>• Take the relevant coefficients and p-values from your R summary() output.</li>}
                      <li>• Report the key predictor coefficients and their p-values in the figure legend or a results table — do not add brackets to the exploratory plots.</li>
                    </ul>
                  );
                }

                if (resultKey === "two_way_anova" || resultKey === "mixed_anova") {
                  return (
                    <ul className="mt-2 space-y-1">
                      {answers.software === "r" && <li>• Take the p-values from your ANOVA table and emmeans output.</li>}
                      <li>• If the interaction was <strong>not significant</strong>: add asterisk labels above each group to indicate main effect significance.</li>
                      <li>• If the interaction was <strong>significant</strong>: add brackets and asterisks showing the simple effects comparisons within each level of the grouping variable.</li>
                      <li>• Report the F statistics and p-values for both main effects and the interaction in the figure legend.</li>
                      <li>
                        <svg className={svgClass} viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
                          <rect x="25" y="10" width="165" height="120" fill="white" stroke="#ccc" strokeWidth="1"/>
                          {/* Group A bars */}
                          <rect x="40" y="55" width="18" height="65" fill="#475569"/>
                          <rect x="62" y="70" width="18" height="50" fill="#94a3b8"/>
                          {/* Group B bars */}
                          <rect x="110" y="40" width="18" height="80" fill="#475569"/>
                          <rect x="132" y="60" width="18" height="60" fill="#94a3b8"/>
                          {/* bracket + asterisk over group A */}
                          <line x1="40" y1="48" x2="80" y2="48" stroke="#be123c" strokeWidth="1.5"/>
                          <line x1="40" y1="48" x2="40" y2="53" stroke="#be123c" strokeWidth="1.5"/>
                          <line x1="80" y1="48" x2="80" y2="53" stroke="#be123c" strokeWidth="1.5"/>
                          <text x="60" y="44" fontSize="11" fontWeight="bold" fill="#be123c" textAnchor="middle">*</text>
                          {/* bracket + asterisk over group B */}
                          <line x1="110" y1="33" x2="150" y2="33" stroke="#be123c" strokeWidth="1.5"/>
                          <line x1="110" y1="33" x2="110" y2="38" stroke="#be123c" strokeWidth="1.5"/>
                          <line x1="150" y1="33" x2="150" y2="38" stroke="#be123c" strokeWidth="1.5"/>
                          <text x="130" y="29" fontSize="11" fontWeight="bold" fill="#be123c" textAnchor="middle">**</text>
                          {/* legend dots */}
                          <rect x="35" y="138" width="8" height="8" fill="#475569"/>
                          <text x="46" y="146" fontSize="7" fill="#64748b">Condition 1</text>
                          <rect x="100" y="138" width="8" height="8" fill="#94a3b8"/>
                          <text x="111" y="146" fontSize="7" fill="#64748b">Condition 2</text>
                          <text x="15" y="70" fontSize="8" fill="#64748b" transform="rotate(-90,15,70)">Outcome</text>
                          <text x="60" y="137" fontSize="8" fill="#64748b" textAnchor="middle">Group A</text>
                          <text x="130" y="137" fontSize="8" fill="#64748b" textAnchor="middle">Group B</text>
                        </svg>
                      </li>
                      <AsteriskTable />
                    </ul>
                  );
                }

                if (resultKey === "one_sample_t" || resultKey === "one_sample_wilcoxon") {
                  return (
                    <ul className="mt-2 space-y-1">
                      {answers.software === "r" && <li>• Take the p-value from your R output.</li>}
                      <li>• Your plot already shows a reference line at the hypothesized value.</li>
                      <li>• Add an asterisk label above your data column using the convention below.</li>
                      <li>• In the figure legend, report the full result, e.g. <em>{resultKey === "one_sample_t" ? "t(14) = 3.82, p = 0.002" : "V = 45, p = 0.008"}</em>.</li>
                      <li>
                        <svg className={svgClass} viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
                          <rect x="30" y="10" width="155" height="110" fill="white" stroke="#ccc" strokeWidth="1"/>
                          {/* baseline */}
                          <line x1="30" y1="115" x2="185" y2="115" stroke="#ccc" strokeWidth="1"/>
                          {/* bar from baseline to mean (mean at y=72, baseline at y=115) */}
                          <rect x="93" y="72" width="30" height="43" fill="#cbd5e1"/>
                          {/* data points overlaid on bar */}
                          {[55,62,70,75,80,85,90].map((y, i) => (
                            <circle key={i} cx={108 + (i % 3 - 1) * 8} cy={y} r="3.5" fill="#475569"/>
                          ))}
                          {/* SD error bar above bar */}
                          <line x1="108" y1="57" x2="108" y2="72" stroke="#475569" strokeWidth="1.5"/>
                          <line x1="102" y1="57" x2="114" y2="57" stroke="#475569" strokeWidth="1.5"/>
                          {/* SD label */}
                          <text x="116" y="55" fontSize="6.5" fill="#64748b">SD</text>
                          {/* reference line at zero (y=115 = baseline, ref line shown as dashed at y=100 for visual clarity) */}
                          <line x1="35" y1="100" x2="180" y2="100" stroke="#be123c" strokeWidth="1.5" strokeDasharray="4,3"/>
                          <text x="162" y="98" fontSize="7" fill="#be123c">ref = 0</text>
                          {/* asterisk above error bar */}
                          <text x="108" y="50" fontSize="12" fontWeight="bold" fill="#be123c" textAnchor="middle">**</text>
                          <text x="15" y="75" fontSize="8" fill="#64748b" transform="rotate(-90,15,75)">Outcome</text>
                        </svg>
                      </li>
                      <AsteriskTable />
                    </ul>
                  );
                }

                /* Group comparison tests */
                return (
                  <ul className="mt-2 space-y-1">
                    {answers.software === "r" && <li>• Take the <strong>p-value</strong> from your R output, then return to GraphPad Prism to annotate the figure.</li>}
                    <li>• Add a bracket above the relevant groups or conditions and place an asterisk label above it using the convention below.</li>
                    <li>• In the figure legend, define what the asterisks mean, e.g. <em>* p &lt; 0.05, ** p &lt; 0.01, *** p &lt; 0.001, ns = not significant</em>.</li>
                    {postHoc && <li>• For pairwise comparisons, only add brackets for the specific comparisons you want to highlight.</li>}
                    <li>• Place brackets high enough that they do not overlap the data points or error bars. If needed, increase the y-axis maximum to create space.</li>
                    <li>
                      <svg className={svgClass} viewBox="0 0 200 155" xmlns="http://www.w3.org/2000/svg">
                        <rect x="25" y="10" width="160" height="125" fill="white" stroke="#ccc" strokeWidth="1"/>
                        {/* y-axis baseline */}
                        <line x1="25" y1="125" x2="185" y2="125" stroke="#ccc" strokeWidth="1"/>
                        {/* Group A bar (from baseline y=125 up to mean y=76) */}
                        <rect x="57" y="76" width="30" height="49" fill="#cbd5e1"/>
                        {/* Group A dots overlaid */}
                        {[68,74,80,86,72].map((y, i) => <circle key={i} cx={72 + (i%3-1)*6} cy={y} r="3.5" fill="#475569"/>)}
                        {/* Group A SD error bar above bar */}
                        <line x1="72" y1="63" x2="72" y2="76" stroke="#475569" strokeWidth="1.5"/>
                        <line x1="66" y1="63" x2="78" y2="63" stroke="#475569" strokeWidth="1.5"/>
                        {/* Group B bar (from baseline y=125 up to mean y=98) */}
                        <rect x="123" y="98" width="30" height="27" fill="#e2e8f0"/>
                        {/* Group B dots overlaid */}
                        {[90,97,103,95,108].map((y, i) => <circle key={i} cx={138 + (i%3-1)*6} cy={y} r="3.5" fill="#94a3b8"/>)}
                        {/* Group B SD error bar above bar */}
                        <line x1="138" y1="85" x2="138" y2="98" stroke="#475569" strokeWidth="1.5"/>
                        <line x1="132" y1="85" x2="144" y2="85" stroke="#475569" strokeWidth="1.5"/>
                        {/* bracket above both groups */}
                        <line x1="72" y1="50" x2="138" y2="50" stroke="#be123c" strokeWidth="1.5"/>
                        <line x1="72" y1="50" x2="72" y2="58" stroke="#be123c" strokeWidth="1.5"/>
                        <line x1="138" y1="50" x2="138" y2="58" stroke="#be123c" strokeWidth="1.5"/>
                        {/* asterisk above bracket */}
                        <text x="105" y="45" fontSize="12" fontWeight="bold" fill="#be123c" textAnchor="middle">*</text>
                        <text x="72" y="145" fontSize="8" fill="#64748b" textAnchor="middle">Group A</text>
                        <text x="138" y="145" fontSize="8" fill="#64748b" textAnchor="middle">Group B</text>
                        <text x="14" y="75" fontSize="8" fill="#64748b" transform="rotate(-90,14,75)">Outcome</text>
                      </svg>
                    </li>
                    <AsteriskTable />
                  </ul>
                );
              })()}
            </div>
          </Panel>
        )}
      </div>

      {/* Always-visible Start Over button */}
      <div className="mx-auto max-w-5xl pt-2 pb-8">
        <button
          type="button"
          className="w-full rounded-2xl border-2 border-slate-300 bg-white py-3 text-sm font-semibold text-slate-500 transition hover:border-slate-500 hover:text-slate-800"
          onClick={() => {
            setAnswers(INITIAL_ANSWERS);
            setChecked([]);
            setShowPlotHelp(false);
            setShowPlotHelp2(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          ↺ Start Over
        </button>
      </div>
    </div>
  );
}
