import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

/** Les visuels uploades sont servis par le back avec une URL relative (/api/v1/files/...). */
@Pipe({ name: 'imgUrl' })
export class ImgUrlPipe implements PipeTransform {
  transform(url: string | null | undefined): string | null {
    if (!url) {
      return null;
    }
    return url.startsWith('/') ? environment.apiUrl + url : url;
  }
}
