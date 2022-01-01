import * as faker from 'faker'
import { fakerForStringField } from '../helper'

test('if field name is `lastName` then `faker.name.lastName`', () => {
  expect(fakerForStringField('lastName')).toBe('faker.name.lastName()')
})
test('if field name is `firstName` then `faker.name.firstName', () => {
  expect(fakerForStringField('firstName')).toBe('faker.name.firstName()')
})
test('if field name is `email` then `faker.internet.email`', () => {
  expect(fakerForStringField('email')).toBe('faker.internet.email()')
})
