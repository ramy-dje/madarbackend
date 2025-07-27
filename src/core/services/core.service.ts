import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Status } from 'src/app/shared/enums/status.enum';

@Injectable()
export class CoreService {
  // Is valid Object_id (Utility)
  /**
   * Checks if the id is a valid mongodb object_id
   * @param {string} id - object id
   * @returns {string} boolean
   * */
  isValid_ObjectId(id: string): boolean {
    // check if this object id is valid
    return Types.ObjectId.isValid(id);
  }

  // doNotExistInArray (Utility)
  /**
   * Returns items that don't exist in array
   * @param {number[] | string[]} array - array
   * @param {number[] | string[]} items - items
   * @returns {number[] | string[]} items that don't exist in the given array
   * */
  doNotExistInArray<T extends string[] | number[]>(array: T, items: T): T {
    // res (item that don't exist)
    const res_items: any[] = [];
    // looping in the items
    items.forEach((item) => {
      // if this item if it doesn't exist in the given array
      if (!array.includes(item as never)) {
        // push it to the items res
        res_items.push(item);
      }
    });
    // returning the items
    return res_items as T;
  }

  // IsValidURL
  /**
   * Returns if the URL is valid or not
   * @param {string} url - string
   * @returns {boolean} 'true' if the URL is valid or 'false' if isn't
   * */
  IsValidURL(url: string): boolean {
    // Regex pattern for checking the URL
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator

    return !!pattern.test(url);
  }

  // Soft Delete Utilities
  /**
   * Builds a filter to exclude trashed items from public queries
   * @param {any} baseFilter - base filter object
   * @returns {any} filter with trash exclusion
   */
  excludeTrashed(baseFilter: any = {}): any {
    return {
      ...baseFilter,
      status: { $ne: Status.TRASH }
    };
  }

  /**
   * Builds a filter to only include trashed items
   * @param {any} baseFilter - base filter object
   * @returns {any} filter for trashed items only
   */
  onlyTrashed(baseFilter: any = {}): any {
    return {
      ...baseFilter,
      status: Status.TRASH
    };
  }

  /**
   * Checks if an item can be permanently deleted (must be in trash)
   * @param {any} item - item to check
   * @returns {boolean} true if item can be permanently deleted
   */
  canPermanentlyDelete(item: any): boolean {
    return item && item.status === Status.TRASH;
  }
}
