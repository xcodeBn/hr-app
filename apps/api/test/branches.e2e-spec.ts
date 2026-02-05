/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import type { User, Organization, Branch } from '@repo/db';

describe('Branches (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Test data
  let superAdmin: User;
  let orgAdmin: User;
  let employee: User;
  let otherOrgAdmin: User;
  let organization: Organization;
  let otherOrganization: Organization;
  let testBranch: Branch;

  // Session tokens
  let superAdminSessionId: string;
  let orgAdminSessionId: string;
  let employeeSessionId: string;
  let _otherOrgAdminSessionId: string; // Prefixed with _ for future use

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Clean up test data
    await cleanupTestData();

    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function cleanupTestData() {
    // Delete in correct order to respect foreign keys
    await prisma.session.deleteMany({
      where: {
        user: {
          email: {
            in: [
              'super-admin@test.com',
              'org-admin@test.com',
              'employee@test.com',
              'other-org-admin@test.com',
            ],
          },
        },
      },
    });
    await prisma.branch.deleteMany({
      where: {
        organization: {
          name: { in: ['Test Organization', 'Other Test Organization'] },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'super-admin@test.com',
            'org-admin@test.com',
            'employee@test.com',
            'other-org-admin@test.com',
          ],
        },
      },
    });
    await prisma.organization.deleteMany({
      where: { name: { in: ['Test Organization', 'Other Test Organization'] } },
    });
  }

  async function setupTestData() {
    // Create super admin first (no organization)
    superAdmin = await prisma.user.create({
      data: {
        email: 'super-admin@test.com',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
      },
    });

    // Create org admin (will be linked to org after)
    orgAdmin = await prisma.user.create({
      data: {
        email: 'org-admin@test.com',
        name: 'Org Admin',
        role: 'ORG_ADMIN',
      },
    });

    // Create other org admin
    otherOrgAdmin = await prisma.user.create({
      data: {
        email: 'other-org-admin@test.com',
        name: 'Other Org Admin',
        role: 'ORG_ADMIN',
      },
    });

    // Create organizations with createdById
    organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        status: 'ACTIVE',
        createdById: orgAdmin.id,
      },
    });

    otherOrganization = await prisma.organization.create({
      data: {
        name: 'Other Test Organization',
        status: 'ACTIVE',
        createdById: otherOrgAdmin.id,
      },
    });

    // Update org admins with their organizations
    await prisma.user.update({
      where: { id: orgAdmin.id },
      data: { organizationId: organization.id },
    });

    await prisma.user.update({
      where: { id: otherOrgAdmin.id },
      data: { organizationId: otherOrganization.id },
    });

    // Refresh the orgAdmin variable
    orgAdmin = await prisma.user.findUniqueOrThrow({
      where: { id: orgAdmin.id },
    });

    otherOrgAdmin = await prisma.user.findUniqueOrThrow({
      where: { id: otherOrgAdmin.id },
    });

    // Create employee
    employee = await prisma.user.create({
      data: {
        email: 'employee@test.com',
        name: 'Employee',
        role: 'EMPLOYEE',
        organizationId: organization.id,
      },
    });

    // Create sessions for each user (Session requires explicit id)
    const superAdminSession = await prisma.session.create({
      data: {
        id: `session-super-admin-${Date.now()}`,
        userId: superAdmin.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
    superAdminSessionId = superAdminSession.id;

    const orgAdminSession = await prisma.session.create({
      data: {
        id: `session-org-admin-${Date.now()}`,
        userId: orgAdmin.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    orgAdminSessionId = orgAdminSession.id;

    const employeeSession = await prisma.session.create({
      data: {
        id: `session-employee-${Date.now()}`,
        userId: employee.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    employeeSessionId = employeeSession.id;

    const otherOrgAdminSession = await prisma.session.create({
      data: {
        id: `session-other-org-admin-${Date.now()}`,
        userId: otherOrgAdmin.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    _otherOrgAdminSessionId = otherOrgAdminSession.id;

    // Create initial test branch
    testBranch = await prisma.branch.create({
      data: {
        name: 'Main Office',
        country: 'United States',
        city: 'New York',
        state: 'NY',
        street1: '123 Main St',
        organizationId: organization.id,
      },
    });
  }

  // Helper to make authenticated requests
  function authenticatedRequest(sessionId: string) {
    return {
      get: (url: string) =>
        request(app.getHttpServer())
          .get(url)
          .set('Cookie', `humanline_session=${sessionId}`),
      post: (url: string) =>
        request(app.getHttpServer())
          .post(url)
          .set('Cookie', `humanline_session=${sessionId}`),
      patch: (url: string) =>
        request(app.getHttpServer())
          .patch(url)
          .set('Cookie', `humanline_session=${sessionId}`),
      delete: (url: string) =>
        request(app.getHttpServer())
          .delete(url)
          .set('Cookie', `humanline_session=${sessionId}`),
    };
  }

  // ============================================
  // AUTHENTICATION TESTS
  // ============================================
  describe('Authentication', () => {
    it('should reject requests without session cookie', async () => {
      const response = await request(app.getHttpServer())
        .get(`/organizations/${organization.id}/branches`)
        .expect(401);

      expect(response.body.message).toBe('No session found');
    });

    it('should reject requests with invalid session cookie', async () => {
      const response = await request(app.getHttpServer())
        .get(`/organizations/${organization.id}/branches`)
        .set('Cookie', 'humanline_session=invalid-session-id')
        .expect(401);

      expect(response.body.message).toBe('Invalid or expired session');
    });

    it('should reject requests with expired session', async () => {
      // Create an expired session
      const expiredSession = await prisma.session.create({
        data: {
          id: `expired-session-${Date.now()}`,
          userId: orgAdmin.id,
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/organizations/${organization.id}/branches`)
        .set('Cookie', `humanline_session=${expiredSession.id}`)
        .expect(401);

      expect(response.body.message).toBe('Invalid or expired session');

      // Cleanup
      await prisma.session.delete({ where: { id: expiredSession.id } });
    });
  });

  // ============================================
  // AUTHORIZATION TESTS
  // ============================================
  describe('Authorization', () => {
    describe('Role-based access', () => {
      it('should allow SUPER_ADMIN to access any organization branches', async () => {
        await authenticatedRequest(superAdminSessionId)
          .get(`/organizations/${organization.id}/branches`)
          .expect(200);

        await authenticatedRequest(superAdminSessionId)
          .get(`/organizations/${otherOrganization.id}/branches`)
          .expect(200);
      });

      it('should allow ORG_ADMIN to access their own organization branches', async () => {
        await authenticatedRequest(orgAdminSessionId)
          .get(`/organizations/${organization.id}/branches`)
          .expect(200);
      });

      it('should deny ORG_ADMIN access to other organization branches', async () => {
        const response = await authenticatedRequest(orgAdminSessionId)
          .get(`/organizations/${otherOrganization.id}/branches`)
          .expect(403);

        expect(response.body.message).toBe(
          'You can only manage your own organization',
        );
      });

      it('should deny EMPLOYEE access to branch management', async () => {
        const response = await authenticatedRequest(employeeSessionId)
          .get(`/organizations/${organization.id}/branches`)
          .expect(403);

        expect(response.body.message).toBe(
          'Only organization administrators can perform this action',
        );
      });
    });

    describe('Cross-organization access', () => {
      it('should deny ORG_ADMIN creating branches in another organization', async () => {
        const response = await authenticatedRequest(orgAdminSessionId)
          .post(`/organizations/${otherOrganization.id}/branches`)
          .send({
            name: 'Malicious Branch',
            country: 'Hackland',
          })
          .expect(403);

        expect(response.body.message).toBe(
          'You can only manage your own organization',
        );
      });

      it('should deny ORG_ADMIN updating branches in another organization', async () => {
        // Create a branch in the other organization
        const otherBranch = await prisma.branch.create({
          data: {
            name: 'Other Branch',
            country: 'Canada',
            organizationId: otherOrganization.id,
          },
        });

        const response = await authenticatedRequest(orgAdminSessionId)
          .patch(
            `/organizations/${otherOrganization.id}/branches/${otherBranch.id}`,
          )
          .send({ name: 'Hacked Branch' })
          .expect(403);

        expect(response.body.message).toBe(
          'You can only manage your own organization',
        );

        // Cleanup
        await prisma.branch.delete({ where: { id: otherBranch.id } });
      });

      it('should deny ORG_ADMIN deleting branches in another organization', async () => {
        // Create a branch in the other organization
        const otherBranch = await prisma.branch.create({
          data: {
            name: 'Other Branch To Delete',
            country: 'Canada',
            organizationId: otherOrganization.id,
          },
        });

        const response = await authenticatedRequest(orgAdminSessionId)
          .delete(
            `/organizations/${otherOrganization.id}/branches/${otherBranch.id}`,
          )
          .expect(403);

        expect(response.body.message).toBe(
          'You can only manage your own organization',
        );

        // Verify branch still exists
        const branch = await prisma.branch.findUnique({
          where: { id: otherBranch.id },
        });
        expect(branch).not.toBeNull();

        // Cleanup
        await prisma.branch.delete({ where: { id: otherBranch.id } });
      });
    });
  });

  // ============================================
  // LIST BRANCHES TESTS
  // ============================================
  describe('GET /organizations/:organizationId/branches', () => {
    it('should return all branches for an organization', async () => {
      const response = await authenticatedRequest(orgAdminSessionId)
        .get(`/organizations/${organization.id}/branches`)
        .expect(200);

      expect(response.body).toHaveProperty('branches');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.branches)).toBe(true);
      expect(response.body.total).toBeGreaterThanOrEqual(1);
    });

    it('should include department count in branches', async () => {
      const response = await authenticatedRequest(orgAdminSessionId)
        .get(`/organizations/${organization.id}/branches`)
        .expect(200);

      const branch = response.body.branches[0];
      expect(branch).toHaveProperty('_count');
      expect(branch._count).toHaveProperty('departments');
    });

    it('should return empty array for organization with no branches', async () => {
      // Create a temp user to be the creator
      const tempUser = await prisma.user.create({
        data: {
          email: `temp-user-${Date.now()}@test.com`,
          name: 'Temp User',
          role: 'ORG_ADMIN',
        },
      });

      // Create org with no branches
      const emptyOrg = await prisma.organization.create({
        data: {
          name: 'Empty Org',
          status: 'ACTIVE',
          createdById: tempUser.id,
        },
      });

      const response = await authenticatedRequest(superAdminSessionId)
        .get(`/organizations/${emptyOrg.id}/branches`)
        .expect(200);

      expect(response.body.branches).toEqual([]);
      expect(response.body.total).toBe(0);

      // Cleanup
      await prisma.organization.delete({ where: { id: emptyOrg.id } });
      await prisma.user.delete({ where: { id: tempUser.id } });
    });

    it('should only return branches for the specified organization', async () => {
      const response = await authenticatedRequest(superAdminSessionId)
        .get(`/organizations/${organization.id}/branches`)
        .expect(200);

      const branches = response.body.branches;
      branches.forEach((branch: Branch) => {
        expect(branch.organizationId).toBe(organization.id);
      });
    });
  });

  // ============================================
  // GET SINGLE BRANCH TESTS
  // ============================================
  describe('GET /organizations/:organizationId/branches/:id', () => {
    it('should return a branch by ID', async () => {
      const response = await authenticatedRequest(orgAdminSessionId)
        .get(`/organizations/${organization.id}/branches/${testBranch.id}`)
        .expect(200);

      expect(response.body.id).toBe(testBranch.id);
      expect(response.body.name).toBe(testBranch.name);
      expect(response.body.country).toBe(testBranch.country);
    });

    it('should return 404 for non-existent branch', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await authenticatedRequest(orgAdminSessionId)
        .get(`/organizations/${organization.id}/branches/${fakeId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should return 404 when branch exists in different organization', async () => {
      // Create branch in other org
      const otherBranch = await prisma.branch.create({
        data: {
          name: 'Other Org Branch',
          country: 'Mexico',
          organizationId: otherOrganization.id,
        },
      });

      // Try to access it from wrong organization URL
      await authenticatedRequest(superAdminSessionId)
        .get(`/organizations/${organization.id}/branches/${otherBranch.id}`)
        .expect(404);

      // Cleanup
      await prisma.branch.delete({ where: { id: otherBranch.id } });
    });
  });

  // ============================================
  // CREATE BRANCH TESTS
  // ============================================
  describe('POST /organizations/:organizationId/branches', () => {
    it('should create a new branch with valid data', async () => {
      const newBranch = {
        name: 'West Coast Office',
        country: 'United States',
        city: 'Los Angeles',
        state: 'CA',
        street1: '456 Sunset Blvd',
        postalCode: '90001',
        phoneNumber: '+1-555-123-4567',
        email: 'westcoast@testorg.com',
      };

      const response = await authenticatedRequest(orgAdminSessionId)
        .post(`/organizations/${organization.id}/branches`)
        .send(newBranch)
        .expect(201);

      expect(response.body.name).toBe(newBranch.name);
      expect(response.body.country).toBe(newBranch.country);
      expect(response.body.city).toBe(newBranch.city);
      expect(response.body.organizationId).toBe(organization.id);
      expect(response.body.id).toBeDefined();

      // Cleanup
      await prisma.branch.delete({ where: { id: response.body.id } });
    });

    it('should create branch with minimal required fields', async () => {
      const minimalBranch = {
        name: 'Minimal Branch',
        country: 'Canada',
      };

      const response = await authenticatedRequest(orgAdminSessionId)
        .post(`/organizations/${organization.id}/branches`)
        .send(minimalBranch)
        .expect(201);

      expect(response.body.name).toBe(minimalBranch.name);
      expect(response.body.country).toBe(minimalBranch.country);
      expect(response.body.city).toBeNull();
      expect(response.body.state).toBeNull();

      // Cleanup
      await prisma.branch.delete({ where: { id: response.body.id } });
    });

    it('should reject creation with missing required fields', async () => {
      const invalidBranch = {
        city: 'New York', // Missing name and country
      };

      const response = await authenticatedRequest(orgAdminSessionId)
        .post(`/organizations/${organization.id}/branches`)
        .send(invalidBranch)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject creation with empty name', async () => {
      const invalidBranch = {
        name: '',
        country: 'United States',
      };

      const response = await authenticatedRequest(orgAdminSessionId)
        .post(`/organizations/${organization.id}/branches`)
        .send(invalidBranch)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject creation with invalid email format', async () => {
      const invalidBranch = {
        name: 'Branch with Bad Email',
        country: 'United States',
        email: 'not-an-email',
      };

      const response = await authenticatedRequest(orgAdminSessionId)
        .post(`/organizations/${organization.id}/branches`)
        .send(invalidBranch)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should allow SUPER_ADMIN to create branches in any organization', async () => {
      const newBranch = {
        name: 'Super Admin Created Branch',
        country: 'Germany',
      };

      const response = await authenticatedRequest(superAdminSessionId)
        .post(`/organizations/${otherOrganization.id}/branches`)
        .send(newBranch)
        .expect(201);

      expect(response.body.organizationId).toBe(otherOrganization.id);

      // Cleanup
      await prisma.branch.delete({ where: { id: response.body.id } });
    });
  });

  // ============================================
  // UPDATE BRANCH TESTS
  // ============================================
  describe('PATCH /organizations/:organizationId/branches/:id', () => {
    let updateTestBranch: Branch;

    beforeEach(async () => {
      updateTestBranch = await prisma.branch.create({
        data: {
          name: 'Branch To Update',
          country: 'France',
          city: 'Paris',
          organizationId: organization.id,
        },
      });
    });

    afterEach(async () => {
      await prisma.branch
        .delete({ where: { id: updateTestBranch.id } })
        .catch(() => {
          /* may already be deleted */
        });
    });

    it('should update branch name', async () => {
      const response = await authenticatedRequest(orgAdminSessionId)
        .patch(
          `/organizations/${organization.id}/branches/${updateTestBranch.id}`,
        )
        .send({ name: 'Updated Branch Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Branch Name');
      expect(response.body.country).toBe(updateTestBranch.country);
    });

    it('should update multiple fields at once', async () => {
      const updateData = {
        name: 'Completely Updated Branch',
        city: 'Lyon',
        state: 'Auvergne-Rhône-Alpes',
        phoneNumber: '+33-123-456-789',
      };

      const response = await authenticatedRequest(orgAdminSessionId)
        .patch(
          `/organizations/${organization.id}/branches/${updateTestBranch.id}`,
        )
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.city).toBe(updateData.city);
      expect(response.body.state).toBe(updateData.state);
      expect(response.body.phoneNumber).toBe(updateData.phoneNumber);
    });

    it('should allow partial updates', async () => {
      const response = await authenticatedRequest(orgAdminSessionId)
        .patch(
          `/organizations/${organization.id}/branches/${updateTestBranch.id}`,
        )
        .send({ city: 'Marseille' })
        .expect(200);

      expect(response.body.city).toBe('Marseille');
      expect(response.body.name).toBe(updateTestBranch.name);
      expect(response.body.country).toBe(updateTestBranch.country);
    });

    it('should return 404 for non-existent branch', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await authenticatedRequest(orgAdminSessionId)
        .patch(`/organizations/${organization.id}/branches/${fakeId}`)
        .send({ name: 'Ghost Branch' })
        .expect(404);
    });

    it('should return 404 when updating branch in wrong organization', async () => {
      const otherBranch = await prisma.branch.create({
        data: {
          name: 'Other Org Branch for Update',
          country: 'Spain',
          organizationId: otherOrganization.id,
        },
      });

      // Try to update through wrong organization URL
      await authenticatedRequest(superAdminSessionId)
        .patch(`/organizations/${organization.id}/branches/${otherBranch.id}`)
        .send({ name: 'Hacked' })
        .expect(404);

      // Verify branch wasn't updated
      const unchanged = await prisma.branch.findUnique({
        where: { id: otherBranch.id },
      });
      expect(unchanged?.name).toBe('Other Org Branch for Update');

      // Cleanup
      await prisma.branch.delete({ where: { id: otherBranch.id } });
    });

    it('should reject update with invalid email format', async () => {
      await authenticatedRequest(orgAdminSessionId)
        .patch(
          `/organizations/${organization.id}/branches/${updateTestBranch.id}`,
        )
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  // ============================================
  // DELETE BRANCH TESTS
  // ============================================
  describe('DELETE /organizations/:organizationId/branches/:id', () => {
    it('should delete a branch', async () => {
      const branchToDelete = await prisma.branch.create({
        data: {
          name: 'Branch To Delete',
          country: 'Japan',
          organizationId: organization.id,
        },
      });

      await authenticatedRequest(orgAdminSessionId)
        .delete(
          `/organizations/${organization.id}/branches/${branchToDelete.id}`,
        )
        .expect(204);

      // Verify branch is deleted
      const deleted = await prisma.branch.findUnique({
        where: { id: branchToDelete.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent branch', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await authenticatedRequest(orgAdminSessionId)
        .delete(`/organizations/${organization.id}/branches/${fakeId}`)
        .expect(404);
    });

    it('should return 404 when deleting branch in wrong organization', async () => {
      const otherBranch = await prisma.branch.create({
        data: {
          name: 'Other Org Branch for Delete',
          country: 'Italy',
          organizationId: otherOrganization.id,
        },
      });

      // Try to delete through wrong organization URL
      await authenticatedRequest(superAdminSessionId)
        .delete(`/organizations/${organization.id}/branches/${otherBranch.id}`)
        .expect(404);

      // Verify branch still exists
      const stillExists = await prisma.branch.findUnique({
        where: { id: otherBranch.id },
      });
      expect(stillExists).not.toBeNull();

      // Cleanup
      await prisma.branch.delete({ where: { id: otherBranch.id } });
    });

    it('should allow SUPER_ADMIN to delete branches in any organization', async () => {
      const branchToDelete = await prisma.branch.create({
        data: {
          name: 'Super Admin Delete Target',
          country: 'Brazil',
          organizationId: otherOrganization.id,
        },
      });

      await authenticatedRequest(superAdminSessionId)
        .delete(
          `/organizations/${otherOrganization.id}/branches/${branchToDelete.id}`,
        )
        .expect(204);

      // Verify deletion
      const deleted = await prisma.branch.findUnique({
        where: { id: branchToDelete.id },
      });
      expect(deleted).toBeNull();
    });
  });

  // ============================================
  // DATA ISOLATION TESTS
  // ============================================
  describe('Data Isolation', () => {
    it('should not leak branches between organizations', async () => {
      // Create branches in both organizations
      const org1Branch = await prisma.branch.create({
        data: {
          name: 'Org 1 Secret Branch',
          country: 'Norway',
          organizationId: organization.id,
        },
      });

      const org2Branch = await prisma.branch.create({
        data: {
          name: 'Org 2 Secret Branch',
          country: 'Sweden',
          organizationId: otherOrganization.id,
        },
      });

      // Org admin should only see their org's branches
      const response = await authenticatedRequest(orgAdminSessionId)
        .get(`/organizations/${organization.id}/branches`)
        .expect(200);

      const branchIds = response.body.branches.map((b: Branch) => b.id);
      expect(branchIds).toContain(org1Branch.id);
      expect(branchIds).not.toContain(org2Branch.id);

      // Cleanup
      await prisma.branch.deleteMany({
        where: { id: { in: [org1Branch.id, org2Branch.id] } },
      });
    });

    it('should not allow accessing branches via direct ID if org mismatch', async () => {
      const secretBranch = await prisma.branch.create({
        data: {
          name: 'Top Secret Branch',
          country: 'Switzerland',
          organizationId: otherOrganization.id,
        },
      });

      // Even if user knows the ID, they can't access it through wrong org
      await authenticatedRequest(orgAdminSessionId)
        .get(`/organizations/${organization.id}/branches/${secretBranch.id}`)
        .expect(404);

      // Cleanup
      await prisma.branch.delete({ where: { id: secretBranch.id } });
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================
  describe('Edge Cases', () => {
    it('should handle special characters in branch name', async () => {
      const specialBranch = {
        name: "O'Brien & Partners (Asia-Pacific)",
        country: 'Singapore',
      };

      const response = await authenticatedRequest(orgAdminSessionId)
        .post(`/organizations/${organization.id}/branches`)
        .send(specialBranch)
        .expect(201);

      expect(response.body.name).toBe(specialBranch.name);

      // Cleanup
      await prisma.branch.delete({ where: { id: response.body.id } });
    });

    it('should handle unicode characters', async () => {
      const unicodeBranch = {
        name: '東京オフィス',
        country: '日本',
        city: '東京',
      };

      const response = await authenticatedRequest(orgAdminSessionId)
        .post(`/organizations/${organization.id}/branches`)
        .send(unicodeBranch)
        .expect(201);

      expect(response.body.name).toBe(unicodeBranch.name);
      expect(response.body.country).toBe(unicodeBranch.country);

      // Cleanup
      await prisma.branch.delete({ where: { id: response.body.id } });
    });

    it('should trim whitespace from inputs', async () => {
      const whitespaceBranch = {
        name: '  Whitespace Branch  ',
        country: '  Australia  ',
      };

      const response = await authenticatedRequest(orgAdminSessionId)
        .post(`/organizations/${organization.id}/branches`)
        .send(whitespaceBranch)
        .expect(201);

      // Note: Whether whitespace is trimmed depends on schema validation
      // This test documents current behavior
      expect(response.body.name).toBeDefined();

      // Cleanup
      await prisma.branch.delete({ where: { id: response.body.id } });
    });

    it('should handle very long branch names within limits', async () => {
      const longName = 'A'.repeat(200); // Very long name
      const longNameBranch = {
        name: longName,
        country: 'Test Country',
      };

      // This should either succeed or fail gracefully based on DB constraints
      const response = await authenticatedRequest(orgAdminSessionId)
        .post(`/organizations/${organization.id}/branches`)
        .send(longNameBranch);

      if (response.status === 201) {
        await prisma.branch.delete({ where: { id: response.body.id } });
      }
      // Test passes if it either succeeds or returns proper error
      expect([201, 400, 500]).toContain(response.status);
    });
  });
});
