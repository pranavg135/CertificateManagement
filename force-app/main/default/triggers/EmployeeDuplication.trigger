trigger EmployeeDuplication on Certification_Request__c (before insert) {
    if(Trigger.isInsert) {
        for(Certification_Request__c cf : Trigger.new)
        {
            List<Certification_Request__c> li = [SELECT Employee__c FROM Certification_Request__c WHERE Employee__c=:cf.Employee__c];
            if(li.size()>0) {
               cf.Employee__c.addError('Certification Request for this Employee already exists !'); 
            } else {break;}
        }
    }
}