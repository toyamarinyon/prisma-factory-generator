import * as faker from 'faker'
import { fakerForNameFiled } from '../helper'

test('if field name is `lastName` then `faker.name.lastName`', () => {
  expect(fakerForNameFiled('lastName')).toBe('faker.name.lastName()')
})
test('if field name is `firstName` then `faker.name.firstName', () => {
  expect(fakerForNameFiled('firstName')).toBe('faker.name.firstName()')
})
