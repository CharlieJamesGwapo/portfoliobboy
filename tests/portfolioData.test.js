import test from 'node:test'
import assert from 'node:assert/strict'
import {
  certifications,
  experiences,
  featuredProjects,
  interactiveGames,
  navigation,
  professionalTitles,
  projectArchive,
  recognitions,
  resumeUrl,
} from '../src/data/portfolioData.js'

test('preserves the verified professional positioning and identity features', () => {
  assert.equal(professionalTitles.length, 8)
  assert.equal(professionalTitles[0], 'AI Developer')
  assert.equal(interactiveGames.length, 8)
  assert.equal(new Set(interactiveGames.map((game) => game.id)).size, interactiveGames.length)
  assert.ok(navigation.some((item) => item.href === '#lab'))
})

test('preserves every current portfolio project and experience entry', () => {
  assert.equal(featuredProjects.length, 6)
  assert.equal(projectArchive.length, 8)
  assert.equal(experiences.length, 10)
  assert.equal(new Set(featuredProjects.map((project) => project.id)).size, featuredProjects.length)
})

test('keeps the original credential inventory and clean resume route', () => {
  assert.equal(certifications.length, 23)
  assert.equal(recognitions.length, 2)
  assert.equal(certifications.length + recognitions.length, 25)
  assert.equal(certifications.filter((credential) => credential.image).length, 5)
  assert.equal(certifications.filter((credential) => credential.title === 'Claude 101').length, 1)
  assert.equal(resumeUrl, '/charlie-james-abejo-resume.pdf')
})

test('only exposes explicitly configured project links', () => {
  const linkedProjects = [...featuredProjects, ...projectArchive].filter((project) => project.url)
  assert.ok(linkedProjects.length > 0)
  linkedProjects.forEach((project) => assert.match(project.url, /^https:\/\//))
})
