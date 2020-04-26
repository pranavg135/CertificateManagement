trigger VoucherDuplication on Certification_Request__c (before insert) {
    if(trigger.isInsert) {
        for(Certification_Request__c obj : Trigger.new)
        {
            if(obj.Voucher__c!=NULL) {
                List <Certification_Request__c> li=[SELECT Certification__c,Voucher__c FROM Certification_Request__c WHERE Certification__c =: obj.Certification__c AND Voucher__c =: obj.Voucher__c];
                if(!li.isEmpty()) {
                    obj.addError('Cannot use same voucher again.');
                }
            }
        }
    }
}