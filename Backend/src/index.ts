import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      const roleService = strapi.plugin('users-permissions').service('role');
      if (!roleService) return;
      const roles = await roleService.find();
      const publicRole = roles.find((r: any) => r.type === 'public');

      if (publicRole) {
        const apis = ['build-log', 'contact-detail', 'experience', 'project', 'skill'];
        
        for (const api of apis) {
          const findAction = `api::${api}.${api}.find`;
          const findOneAction = `api::${api}.${api}.findOne`;
          
          for (const action of [findAction, findOneAction]) {
            const exists = await strapi.db.query('plugin::users-permissions.permission').findOne({
              where: { action, role: publicRole.id }
            });
            
            if (!exists) {
              await strapi.db.query('plugin::users-permissions.permission').create({
                data: { action, role: publicRole.id }
              });
            }
          }
        }
        console.log('Public permissions successfully bootstrapped for PostgreSQL.');
      }
    } catch (err) {
      console.error('Failed to bootstrap public permissions:', err);
    }
  },
};
