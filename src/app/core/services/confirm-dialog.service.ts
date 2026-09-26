import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';

import { ConfirmDialogComponent, ConfirmDialogData } from '@app/shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Asks the user to confirm something (e.g. a delete).
 *   this.confirmDialog.confirm({ title: 'Delete flip?', message: '...' })
 *     .subscribe((ok) => { if (ok) ... });
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private dialog = inject(MatDialog);

  confirm(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        width: '420px',
        maxWidth: '95vw',
        data,
      })
      .afterClosed()
      .pipe(map((confirmed) => confirmed === true));
  }
}
