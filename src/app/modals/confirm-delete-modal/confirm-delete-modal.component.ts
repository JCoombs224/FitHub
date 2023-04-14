import { OnInit, Component } from "@angular/core";
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-delete-modal',
  templateUrl: 'confirm-delete-modal.component.html',
})
export class ConfirmDeleteModalComponent implements OnInit {

  object = 'item';

  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit(): void {
  }

  public confirmDelete() {
    if (this.bsModalRef.content.callback != null){
      this.bsModalRef.content.callback(true);
      this.bsModalRef.hide();
    }
  }

  public cancelDelete() {
    if (this.bsModalRef.content.callback != null) {
      this.bsModalRef.content.callback(false);
      this.bsModalRef.hide();
    }
  }
}
