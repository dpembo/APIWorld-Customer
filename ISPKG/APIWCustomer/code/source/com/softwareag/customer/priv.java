package com.softwareag.customer;

// -----( IS Java Code Template v1.2

import com.wm.data.*;
import com.wm.util.Values;
import com.wm.app.b2b.server.Service;
import com.wm.app.b2b.server.ServiceException;
// --- <<IS-START-IMPORTS>> ---
// --- <<IS-END-IMPORTS>> ---

public final class priv

{
	// ---( internal utility methods )---

	final static priv _instance = new priv();

	static priv _newInstance() { return new priv(); }

	static priv _cast(Object o) { return (priv)o; }

	// ---( server methods )---




	public static final void populateCustomers (IData pipeline)
        throws ServiceException
	{
		// --- <<IS-START(populateCustomers)>> ---
		// @sigtype java 3.5
		// [o] recref:1:required customers com.softwareag.customer.priv.docs:Customer
		// pipeline
		
		// pipeline
		IDataCursor pipelineCursor = pipeline.getCursor();
		
		// customers
		customers = new IData[2];
		
		customers[0] = IDataFactory.create();
		IDataCursor customersCursor = customers[0].getCursor();
		IDataUtil.put( customersCursor, "id", "ukdp" );
		
		// customers.name
		IData	name = IDataFactory.create();
		IDataCursor nameCursor = name.getCursor();
		IDataUtil.put( nameCursor, "first", "Dave" );
		IDataUtil.put( nameCursor, "middle", "" );
		IDataUtil.put( nameCursor, "surname", "Pemberton" );
		nameCursor.destroy();
		IDataUtil.put( customersCursor, "name", name );
		
		// customers.organisation
		IData	organisation = IDataFactory.create();
		IDataCursor organisationCursor = organisation.getCursor();
		IDataUtil.put( organisationCursor, "name", "name" );
		organisationCursor.destroy();
		IDataUtil.put( customersCursor, "organisation", organisation );
		
		// customers.contact
		IData	contact = IDataFactory.create();
		IDataCursor contactCursor = contact.getCursor();
		IDataUtil.put( contactCursor, "email", "dave.pemberton@softwareag.com" );
		IDataUtil.put( contactCursor, "telephone", "01332611000" );
		
		// customers.contact.address
		IData	address = IDataFactory.create();
		IDataCursor addressCursor = address.getCursor();
		IDataUtil.put( addressCursor, "line1", "Software AG UK Ltd" );
		IDataUtil.put( addressCursor, "line2", "Locomotive Way" );
		IDataUtil.put( addressCursor, "line3", "Derby" );
		IDataUtil.put( addressCursor, "line4", "Derbyshire" );
		IDataUtil.put( addressCursor, "line5", "DE24 8PU" );
		addressCursor.destroy();
		IDataUtil.put( contactCursor, "address", address );
		contactCursor.destroy();
		IDataUtil.put( customersCursor, "contact", contact );
		customersCursor.destroy();
		IDataUtil.put( pipelineCursor, "customers", customers );
		//	pipelineCursor.destroy();
		
		
		customers[1] = IDataFactory.create();
		customersCursor = customers[1].getCursor();
		IDataUtil.put( customersCursor, "id", "ukjs" );
		
		// customers.name
		name = IDataFactory.create();
		nameCursor = name.getCursor();
		IDataUtil.put( nameCursor, "first", "John" );
		IDataUtil.put( nameCursor, "middle", "Jason" );
		IDataUtil.put( nameCursor, "surname", "Smith" );
		nameCursor.destroy();
		IDataUtil.put( customersCursor, "name", name );
		
		// customers.organisation
		organisation = IDataFactory.create();
		organisationCursor = organisation.getCursor();
		IDataUtil.put( organisationCursor, "name", "name" );
		organisationCursor.destroy();
		IDataUtil.put( customersCursor, "organisation", organisation );
		
		// customers.contact
		contact = IDataFactory.create();
		contactCursor = contact.getCursor();
		IDataUtil.put( contactCursor, "email", "johnsmith@email.com" );
		
		// customers.contact.address
		address = IDataFactory.create();
		addressCursor = address.getCursor();
		IDataUtil.put( addressCursor, "line1", "123 Letsbe Avenue" );
		IDataUtil.put( addressCursor, "line2", "London" );
		IDataUtil.put( addressCursor, "line3", "E1 1LL" );
		IDataUtil.put( addressCursor, "line4", "" );
		IDataUtil.put( addressCursor, "line5", "" );
		addressCursor.destroy();
		IDataUtil.put( contactCursor, "address", address );
		contactCursor.destroy();
		IDataUtil.put( customersCursor, "contact", contact );
		customersCursor.destroy();
		IDataUtil.put( pipelineCursor, "customers", customers );
		pipelineCursor.destroy();
			
		// --- <<IS-END>> ---

                
	}

	// --- <<IS-START-SHARED>> ---
	public static IData[] customers = new IData[2];
	// --- <<IS-END-SHARED>> ---
}

