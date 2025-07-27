import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from '../schemas/service.schema';

@Injectable()
export class FeaturesMigrationService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  /**
   * Migrates existing string features to the new key-value structure
   * This should be run once after deploying the new schema
   */
  async migrateFeatures(): Promise<{ migrated: number; errors: number }> {
    let migrated = 0;
    let errors = 0;

    try {
      // Find all services with string features
      const services = await this.serviceModel.find({
        features: { $exists: true, $type: 'array' }
      });

      for (const service of services) {
        try {
          // Check if features are still strings (old format)
          if (service.features && service.features.length > 0) {
            const firstFeature = service.features[0];
            
            // If it's a string, migrate it
            if (typeof firstFeature === 'string') {
              const migratedFeatures = (service.features as unknown as string[]).map((feature, index) => ({
                title: {
                  en: feature,
                  ar: feature,
                  fr: feature
                },
                order: index,
                isHighlighted: false
              }));

              await this.serviceModel.updateOne(
                { _id: service._id },
                { $set: { features: migratedFeatures } }
              );

              migrated++;
              console.log(`Migrated service: ${service.title}`);
            }
          }
        } catch (error) {
          console.error(`Error migrating service ${service._id}:`, error);
          errors++;
        }
      }

      console.log(`Migration completed. Migrated: ${migrated}, Errors: ${errors}`);
      return { migrated, errors };
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Reverts features back to string format (if needed)
   */
  async revertFeatures(): Promise<{ reverted: number; errors: number }> {
    let reverted = 0;
    let errors = 0;

    try {
      const services = await this.serviceModel.find({
        'features.title': { $exists: true }
      });

      for (const service of services) {
        try {
          if (service.features && service.features.length > 0) {
            const revertedFeatures = service.features.map(feature => 
              typeof feature === 'object' ? feature.title : feature
            );

            await this.serviceModel.updateOne(
              { _id: service._id },
              { $set: { features: revertedFeatures } }
            );

            reverted++;
            console.log(`Reverted service: ${service.title}`);
          }
        } catch (error) {
          console.error(`Error reverting service ${service._id}:`, error);
          errors++;
        }
      }

      console.log(`Revert completed. Reverted: ${reverted}, Errors: ${errors}`);
      return { reverted, errors };
    } catch (error) {
      console.error('Revert failed:', error);
      throw error;
    }
  }
} 