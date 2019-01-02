import { Resolver, registerEnumType } from 'type-graphql';
import { Premium } from '../entity/premium';
import { Plan } from 'steemdunk-common';

@Resolver(of => Premium)
export class PremiumResolver {

}

registerEnumType(Plan, {
  name: 'Plan',
  description: 'Type of premium plan users can have activated'
});
