import uuid


from fastapi import APIRouter, Depends, Query, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session


from backend.db import database
from backend.routes.companies import (
    CompanyBatchOutput,
    fetch_companies_with_liked,
)


router = APIRouter(
    prefix="/associations",
    tags=["company_collection_associations"],
)
class CompanyCollectionRequest(BaseModel):
    companyIds: list[int]
    collectionId: uuid.UUID = Field(default_factory=uuid.uuid4)
    allTag: bool
    currentCollection: uuid.UUID = Field(default_factory=uuid.uuid4)


class CompanyCollectionAssociationMetadata(BaseModel):
    id: int
    collection_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    company_id: int


class AssociationBatchOutput(BaseModel):
    associations: list[CompanyCollectionAssociationMetadata]


class CompanyCollectionOutput(CompanyBatchOutput, CompanyCollectionAssociationMetadata):
    pass 

@router.post("/", response_model=CompanyCollectionAssociationMetadata)
def create_association(
    association: CompanyCollectionAssociationMetadata, 
    db: Session = Depends(database.get_db)
):
    new_association = CompanyCollectionAssociationMetadata(
        company_id=association.company_id, 
        collection_id=association.collection_id
    )
    db.add(new_association)
    db.commit()
    db.refresh(new_association)
    return new_association

@router.post("/addMultipleAssociations", response_model=bool)
async def create_associations(
    request: CompanyCollectionRequest, 
    db: Session = Depends(database.get_db)
):

    print("Starting")
    companies_to_add = []


    if request.allTag:
        print("For transferring entire collections")
        outgoing_company_ids = {
            cid for (cid,) in db.query(database.CompanyCollectionAssociation.company_id)
            .filter(database.CompanyCollectionAssociation.collection_id == request.currentCollection)
            .all()
        }
        incoming_company_ids = {
            cid for (cid,) in db.query(database.CompanyCollectionAssociation.company_id)
            .filter(database.CompanyCollectionAssociation.collection_id == request.collectionId)
            .all()
        }
        print(request.collectionId)
        print(request.currentCollection)
        print('outging',len(outgoing_company_ids))
        print("incoming", len(incoming_company_ids))

        outgoing_company_ids.difference_update(incoming_company_ids)

        companies_to_add = outgoing_company_ids.copy()


        print("# of companies to add", len(companies_to_add))
        if companies_to_add:
            print("len of difference", len(companies_to_add))
    
    else:
        # originally a list of strings
        formatted_company_ids = [int(i) for i in request.companyIds]
        companies_set = set(formatted_company_ids)
        incoming_company_ids = {
            cid for (cid,) in db.query(database.CompanyCollectionAssociation.company_id)
            .filter(database.CompanyCollectionAssociation.collection_id == request.collectionId)
            .all()
        }
        companies_set.difference_update(incoming_company_ids)
        companies_to_add = companies_set.copy()
        

    # error catching! if you try to add only things that have been added
    if not companies_to_add: 
        print("selected companies are all duplicates")
        return True
    
    colId= request.collectionId

    companies = [database.CompanyCollectionAssociation(company_id=i, collection_id=colId) for i in list(companies_to_add)]

    batch_size = 500  
    for i in range(0, 500, batch_size):
        try:
            batch = companies[i:i + batch_size]
            db.bulk_save_objects(batch)
            db.commit() 
        except Exception as e:
            print(f"Error during bulk save: {e}")
            db.rollback() 



    return True


@router.get("/", response_model=list[CompanyCollectionAssociationMetadata])
def get_associations(db: Session = Depends(database.get_db)):
    associations = db.query(database.CompanyCollectionAssociation).all()
    return [
    CompanyCollectionAssociationMetadata(
        id=association.id,
        collection_id=association.collection_id,
        company_id=association.company_id
    )
    for association in associations
    ]

