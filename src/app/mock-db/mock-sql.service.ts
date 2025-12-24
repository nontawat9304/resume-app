import { Injectable } from '@angular/core';

export interface SqlQuery {
    table: string;
    type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    data?: any;
    where?: (item: any) => boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MockSqlService {
    private dbPrefix = 'sql_db_';

    constructor() {
        this.initializeDb();
    }

    private initializeDb() {
        if (typeof localStorage === 'undefined') return;

        // Seed Data if empty
        if (!localStorage.getItem(this.dbPrefix + 'users')) {
            const initialUsers = [
                { id: '1', name: 'Admin User', email: 'admin@test.com', password: 'admin', role: 'admin', avatar: '' },
                { id: '2', name: 'John Doe', email: 'test@test.com', password: '1234', role: 'user', avatar: 'assets/profile-placeholder.png' }
            ];
            this.saveTable('users', initialUsers);
        }

        if (!localStorage.getItem(this.dbPrefix + 'resumes')) {
            this.saveTable('resumes', []);
        }
    }

    private getTableAsString(tableName: string): string {
        return localStorage.getItem(this.dbPrefix + tableName) || '[]';
    }

    private saveTable(tableName: string, data: any[]) {
        localStorage.setItem(this.dbPrefix + tableName, JSON.stringify(data));
    }

    // SIMULATE SQL QUERY
    execute<T>(query: SqlQuery): T[] | any {
        const tableData = JSON.parse(this.getTableAsString(query.table));

        switch (query.type) {
            case 'SELECT':
                if (query.where) {
                    return tableData.filter(query.where);
                }
                return tableData;

            case 'INSERT':
                tableData.push(query.data);
                this.saveTable(query.table, tableData);
                return { success: true, insertedId: query.data.id };

            case 'UPDATE':
                let updatedCount = 0;
                const updatedTable = tableData.map((item: any) => {
                    if (query.where && query.where(item)) {
                        updatedCount++;
                        return { ...item, ...query.data };
                    }
                    return item;
                });
                this.saveTable(query.table, updatedTable);
                return { success: true, rowsAffected: updatedCount };

            case 'DELETE':
                const initialLen = tableData.length;
                const filteredTable = tableData.filter((item: any) => !query.where || !query.where(item));
                this.saveTable(query.table, filteredTable);
                return { success: true, rowsAffected: initialLen - filteredTable.length };
        }
        return [];
    }

    // Helpers
    query(table: string, filterFn?: (item: any) => boolean) {
        return this.execute({ table, type: 'SELECT', where: filterFn });
    }

    insert(table: string, data: any) {
        return this.execute({ table, type: 'INSERT', data });
    }

    update(table: string, data: any, filterFn: (item: any) => boolean) {
        return this.execute({ table, type: 'UPDATE', data, where: filterFn });
    }

    delete(table: string, filterFn: (item: any) => boolean) {
        return this.execute({ table, type: 'DELETE', where: filterFn });
    }
}
