export enum Plan {
  BRONZE = 10,
  SILVER = 20,
  GOLD = 30,
  DIAMOND = 40,
  PLATINUM = 50
}

export enum PlanPrice {
  SILVER = 5,
  SILVER_MONTHLY = 2,
  GOLD = 10,
  GOLD_MONTHLY = 3,
  DIAMOND = 25,
  DIAMOND_MONTHLY = 5,
  PLATINUM = 80,
  PLATINUM_MONTHLY = 10
}

export enum CurationQuota {
  BRONZE = 20,
  SILVER = 50,
  GOLD = 100,
  DIAMOND = 500,
  PLATINUM = 4000
}

export class Payment {

  static planToString(plan: Plan): string {
    if (plan === Plan.BRONZE) {
      return 'BRONZE';
    } else if (plan === Plan.SILVER) {
      return 'SILVER';
    } else if (plan === Plan.GOLD) {
      return 'GOLD';
    } else if (plan === Plan.DIAMOND) {
      return 'DIAMOND';
    } else if (plan === Plan.PLATINUM) {
      return 'PLATINUM';
    }
    return 'unknown';
  }

  static getQuota(plan: Plan|undefined): number {
    if (plan === Plan.BRONZE) {
      return CurationQuota.BRONZE;
    } else if (plan === Plan.SILVER) {
      return CurationQuota.SILVER;
    } else if (plan === Plan.GOLD) {
      return CurationQuota.GOLD;
    } else if (plan === Plan.DIAMOND) {
      return CurationQuota.DIAMOND;
    } else if (plan === Plan.PLATINUM) {
      return CurationQuota.PLATINUM;
    }

    return 0;
  }

  static getUpgradablePlans(currentPlan: number) {
    const plans: number[] = [];
    for (const p in Plan) {
      const num = parseInt(p);
      if (!isNaN(num) && num > currentPlan) {
        plans.push(num);
      }
    }
    return plans;
  }
}
