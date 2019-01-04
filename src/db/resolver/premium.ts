import { Resolver, registerEnumType, Mutation, Arg } from 'type-graphql';
import { Premium } from '../entity/premium';
import { Plan } from 'steemdunk-common';
import { ResourceNotFoundError } from '../errors';

@Resolver(of => Premium)
export class PremiumResolver {
  @Mutation(returns => Premium)
  static async updatePremiumEntity(@Arg('id') id: number,
                                    @Arg('plan', { nullable: true }) plan: Plan,
                                    @Arg('expiry', { nullable: true }) expiry: Date): Promise<Premium> {
    const prem = await Premium.findOne(id);
    if (!prem) throw new ResourceNotFoundError('Premium ID not found');
    if (plan !== undefined) prem.plan = plan;
    if (expiry !== undefined) prem.expiry = expiry;
    return await prem.save();
  }
}

registerEnumType(Plan, {
  name: 'Plan',
  description: 'Type of premium plan users can have activated'
});
